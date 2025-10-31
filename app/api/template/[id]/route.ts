// D:\vscodedata\codebuddy\app\api\template\[id]\route.ts

import { readTemplateStructureFromJson, saveTemplateStructureToJson } from "@/features/playground/lib/path-to-json";
import {db} from "@/lib/db";
import path from 'path'
import { NextRequest } from "next/server";
import { templatePaths } from "@/lib/template_path";
import fs from 'fs/promises';

function validateJsonStructure(data: unknown): boolean {
    try {
        JSON.parse(JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Invalid JSON structure:', error);
        return false;
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        if (!id) {
            return Response.json({ error: 'Missing playground ID' }, { status: 400 });
        }

        // First, find the playground
        const playground = await db.playground.findUnique({
            where: { id }
        });

        if (!playground) {
            return Response.json({ error: 'Playground not found' }, { status: 404 });
        }

        // Check if playground has template data
        if (!playground.template) {
            return Response.json({ error: 'Playground has no template assigned' }, { status: 400 });
        }

        // Get template key from playground
        const templateKey = playground.template;
        console.log('Template key:', templateKey);
        console.log('Available template paths:', Object.keys(templatePaths));

        // Check if template path exists
        const templatePath = templatePaths[templateKey];
        if (!templatePath) {
            return Response.json({ error: `Invalid template: ${templateKey}` }, { status: 404 });
        }

        try {
            const inputPath = path.join(process.cwd(), templatePath);
            const outputFile = path.join(process.cwd(), `output/${templateKey}.json`);
            
            console.log('Input path:', inputPath);
            console.log('Output path:', outputFile);

            // Check if input file exists
            try {
                await fs.access(inputPath);
            } catch (fileError) {
                return Response.json({ error: `Template file not found: ${inputPath}` }, { status: 500 });
            }

            // Generate the template structure
            await saveTemplateStructureToJson(inputPath, outputFile);
            const result = await readTemplateStructureFromJson(outputFile);

            if (!validateJsonStructure(result.items)) {
                return Response.json({ error: 'Invalid JSON structure' }, { status: 500 });
            }

            // Clean up temporary file
            await fs.unlink(outputFile);
            
            return Response.json({ success: true, templateJson: result }, { status: 200 });
        } catch (processingError) {
            console.error('Error processing template:', processingError);
            return Response.json({ error: 'Failed to process template' }, { status: 500 });
        }
    } catch (error) {
        console.error('Unexpected error in template API:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
