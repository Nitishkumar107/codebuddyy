import { error } from "console";
import { Columns } from "lucide-react";
import { Content } from "next/font/google";
import {type NextRequest ,NextResponse} from "next/server";
import { property, string } from "zod";




interface CodeSuggestionRequest{
    fileContent:string;
    cursorLine:number;
    cursorColumn:number;
    suggestionType:string;
    fileName?:string
}
/** 
interface CodeContext{
    language: string
    framework?: string
    beforeContext:string
    currentLine: string
    afterContext: string
    cursorPosition: {line: number; cloumn: number}
    isInFunction: boolean
    isInClass: boolean
    isAfterComment:boolean
    incompletePatterns: string[]
}
*/
export async function POST (request:NextRequest){
    {
        try{
            const body:CodeSuggestionRequest = await request.json()
            const {fileContent, cursorColumn, cursorLine, suggestionType, fileName}= body;
            //validate input
            if (!fileContent || cursorLine < 0 || cursorColumn < 0 || !suggestionType){
                return NextResponse.json({error: "Invalid input parameters"}, {status: 400})
            }
            //  analyze the context
            const context = analyzeCodeContext (fileContent, cursorLine, cursorColumn, fileName)

            // Build ai prompt
            const prompt = buildPrompt(context, suggestionType)

            // call ai service
            const suggestion = await generateSuggestion(prompt);

            return NextResponse.json({
                suggestion,
                context,
                metadata:{
                    language: context.language,
                    framework: context.framework,
                    position: context.cursorPosition,

                }
            })

        }
        catch (error:any){
            console.error("Context analysis error: ", error)
            return NextResponse.json({error: "Internal server error", message: error.message}, {status: 500})
        }
    }
}

// Analyze the code context around the cursor position
function analyzeCodeContext(content: string, line: number, column: number, fileName?: string): CodeContext {
    const lines = content.split("\n")
    const currentLine = lines[line] || ""

    // Get surrounding context (10 lines before and after)
    const contextRadius = 10
    const startLine = Math.max(0, line - contextRadius)
    const endLine = Math.min(lines.length, line + contextRadius + 1) // +1 because slice is exclusive

    const beforeContext = lines.slice(startLine, line).join("\n")
    const afterContext = lines.slice(line + 1, endLine).join("\n")

    // Detect language and framework
    const language = detectLanguage(content)
    const framework = detectFramework(content)

    // Analyze code patterns
    const isInFunction = detectInFunction(lines, line)
    const isInClass = detectInClass(lines, line)
    const isAfterComment = detectAfterComment(currentLine, column)
    const incompletePatterns = detectIncompletePatterns(currentLine, column)

    return {
        language,
        framework,
        beforeContext,
        currentLine,
        afterContext,
        cursorPosition: { line, column },
        isInFunction,
        isInClass, 
        isAfterComment,
        incompletePatterns
        
    }
}


// Build AI Prompt based on context
/**
 * Builds a comprehensive prompt for code completion assistant
 * @param context - The code context containing all relevant information
 * @param suggestionType - Type of suggestion to generate (e.g., "function", "variable", "method")
 * @returns Formatted prompt string for the code completion assistant
 */
function buildPrompt(context: CodeContext, suggestionType: string): string {
  // Validate input
    if (!context || !context.language) {
        throw new Error('Invalid context provided to buildPrompt');
    }

    // Extract and format cursor position information
    const cursorLine = context.currentLine || '';
    const cursorPosition = context.cursorPosition || { column: 0 };
    
    // Split current line at cursor position
    const beforeCursor = cursorLine.substring(0, cursorPosition.column);
    const afterCursor = cursorLine.substring(cursorPosition.column);
    
    // Format incomplete patterns for display
    const incompletePatterns = context.incompletePatterns && context.incompletePatterns.length > 0
        ? context.incompletePatterns.join(", ")
        : "None";

    // Build the prompt with proper formatting and structure
    return `You are an expert code completion assistant specializing in ${context.language} development.

## TASK DESCRIPTION
Generate a ${suggestionType} suggestion that fits seamlessly into the current code context.

## CODE CONTEXT
Language: ${context.language}
Framework: ${context.framework || "None specified"}

## CURRENT LINE ANALYSIS
${beforeCursor} |CURSOR|${afterCursor}

## CONTEXTUAL INFORMATION
- In Function: ${context.isInFunction ? "Yes" : "No"}
- In Class: ${context.isInClass ? "Yes" : "No"}
- After Comment: ${context.isAfterComment ? "Yes" : "No"}
- Incomplete Patterns: ${incompletePatterns}
- Current Line: "${cursorLine}"

## CODE QUALITY REQUIREMENTS
1. Provide only the code that should be inserted at the cursor position
2. Maintain consistent indentation and code style
3. Follow ${context.language} best practices and conventions
4. Ensure the suggestion is contextually appropriate and syntactically correct
5. Consider the existing code structure and patterns
6. If applicable, use appropriate type annotations for TypeScript/JavaScript
7. Follow the existing code formatting and naming conventions

## SPECIAL CONSIDERATIONS
- When in a function context, consider the function's return type and parameters
- When in a class context, consider class members and access modifiers
- When after a comment, the suggestion should follow the comment's intent
- When incomplete patterns are detected, complete them appropriately
- When in an array/object context, maintain proper syntax

## GENERATION INSTRUCTIONS
Generate only the code segment that should be inserted at the cursor position.
Do not include any explanations, comments, or additional text.
Ensure the output is valid ${context.language} syntax.

## SUGGESTION:
`;
}

/**
 * Enhanced CodeContext interface with more detailed information
 */
interface CodeContext {
    /**
     * Programming language of the current file
     */
    language: string;
    
    /**
     * Framework or library being used (e.g., React, Angular, Node.js)
     */
    framework?: string;
    
    /**
     * The current line of code where cursor is positioned
     */
    currentLine: string;
    
    /**
     * Cursor position information
     */
    cursorPosition: {
        /**
         * Column position (0-indexed)
         */
        line: number;
        column: number;
    };
    
    /**
     * Text before the cursor in the current line
     */
    beforeContext: string;
    
    /**
     * Text after the cursor in the current line
     */
    afterContext: string;
    
    /**
     * Whether cursor is inside a function
     */
    isInFunction: boolean;
    
    /**
     * Whether cursor is inside a class
     */
    isInClass: boolean;
    
    /**
     * Whether cursor is positioned after a comment
     */
    isAfterComment: boolean;
    
    /**
     * Array of incomplete code patterns detected
     */
    incompletePatterns: string[];
    
    /**
     * Additional context information
     */
    additionalContext?: Record<string, any>;
}

/**
 * Generates a code suggestion using AI service
 * @param prompt - The prompt string to send to the AI service
 * @returns Promise resolving to the generated code suggestion
 */
async function generateSuggestion(prompt: string): Promise<string> {
    try {
        // Validate input
        if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid prompt provided to generateSuggestion');
        }

        const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "quen3-coder:30b",
            prompt,
            stream: false, // Changed to false for simplicity, or keep true if streaming is needed
            options: {
            temperature: 0.7,
            max_tokens: 300 // Fixed typo: was "max_token"
            }
        })
        });

        // Check if response is ok
        if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText} (Status: ${response.status})`);
        }

        const data = await response.json();
        
        // Handle empty response
        if (!data || !data.response) {
        throw new Error('AI service returned empty response');
        }

        let suggestion = data.response;

        // Clean up the suggestion
        if (suggestion.includes("```")) {
        const codeMatch = suggestion.match(/```[\w]*\n?([\s\S]*?)```/);
        suggestion = codeMatch ? codeMatch[1].trim() : suggestion;
        }
        
        // Remove cursor marker
        suggestion = suggestion.replace(/\|CURSOR\|/g, "").trim();
        
        // Additional cleanup for edge cases
        if (!suggestion) {
        throw new Error('Generated suggestion is empty');
        }

        return suggestion;
    } catch (error: any) {
        console.error("AI generation error:", error);
        
        // Return a safe fallback
        if (error instanceof Error) {
        console.error("Error details:", error.message);
        }
        
        return "// AI suggestion unavailable";
    }
    }

    /**
     * Alternative implementation with streaming support (if needed)
     */
    async function generateSuggestionStreaming(prompt: string): Promise<string> {
    try {
        if (!prompt || typeof prompt !== 'string') {
        throw new Error('Invalid prompt provided to generateSuggestion');
        }

        const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "quen3-coder:30b",
            prompt,
            stream: true, // Enable streaming if your backend supports it
            options: {
            temperature: 0.7,
            max_tokens: 300
            }
        })
        });

        if (!response.ok) {
        throw new Error(`AI service error: ${response.statusText} (Status: ${response.status})`);
        }

        // Handle streaming response if needed
        const reader = response.body?.getReader();
        if (!reader) {
        throw new Error('Failed to get response stream reader');
        }

        let fullResponse = '';
        const decoder = new TextDecoder();

        // Read the stream
        while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        fullResponse += chunk;
        }

        // Parse the JSON response
        const data = JSON.parse(fullResponse);
        let suggestion = data.response || '';

        // Clean up the suggestion
        if (suggestion.includes("```")) {
        const codeMatch = suggestion.match(/```[\w]*\n?([\s\S]*?)```/);
        suggestion = codeMatch ? codeMatch[1].trim() : suggestion;
        }
        
        suggestion = suggestion.replace(/\|CURSOR\|/g, "").trim();
        
        return suggestion;
    } catch (error: any) {
        console.error("AI generation error:", error);
        
        if (error instanceof Error) {
        console.error("Error details:", error.message);
        }
        
        return "// AI suggestion unavailable";
    }
}


const detectLanguage = (content: string): string => {
    if (!content) return "LanguageFind";
    
    // Trim content to avoid issues with whitespace
    const trimmedContent = content.trim();
    
    // TypeScript detection
    if (trimmedContent.includes("interface") || 
        trimmedContent.includes("typescript") || 
        trimmedContent.includes(".ts") ||
        trimmedContent.includes("import") || 
        trimmedContent.includes("export")) {
        return "TypeScript";
    }
    
    // JavaScript detection
    if (trimmedContent.includes("function") || 
        trimmedContent.includes("const ") || 
        trimmedContent.includes("let ") || 
        trimmedContent.includes("var ") ||
        trimmedContent.includes("=>")) {
        return "JavaScript";
    }
    
    // Python detection
    if (trimmedContent.includes("def ") || 
        trimmedContent.includes("import ") || 
        trimmedContent.includes("from ") ||
        trimmedContent.includes("print(")) {
        return "Python";
    }
    
    // Go detection
    if (trimmedContent.includes("func ") || 
        trimmedContent.includes("package ") ||
        trimmedContent.includes("import (")) {
        return "Go";
    }
    
    // Java detection
    if (trimmedContent.includes("public class") || 
        trimmedContent.includes("import java") ||
        trimmedContent.includes("public static void main")) {
        return "Java";
    }
    
    // C++ detection
    if (trimmedContent.includes("#include <iostream>") || 
        trimmedContent.includes("std::cout") ||
        trimmedContent.includes("int main")) {
        return "C++";
    }
    
    // C detection
    if (trimmedContent.includes("#include <stdio.h>") || 
        trimmedContent.includes("printf(") ||
        trimmedContent.includes("main()")) {
        return "C";
    }
    
    // C# detection
    if (trimmedContent.includes("namespace ") || 
        trimmedContent.includes("using System") ||
        trimmedContent.includes("class ")) {
        return "C#";
    }
    
    // Ruby detection
    if (trimmedContent.includes("def ") || 
        trimmedContent.includes(".each") ||
        trimmedContent.includes("puts ")) {
        return "Ruby";
    }
    
    // PHP detection
    if (trimmedContent.includes("<?php") || 
        trimmedContent.includes("function ") ||
        trimmedContent.includes("$")) {
        return "PHP";
    }
    
    // Rust detection
    if (trimmedContent.includes("fn ") || 
        trimmedContent.includes("let mut ") ||
        trimmedContent.includes("use ")) {
        return "Rust";
    }
    
    // HTML detection
    if (trimmedContent.includes("<html") || 
        trimmedContent.includes("<div") ||
        trimmedContent.includes("<span")) {
        return "HTML";
    }
    
    // CSS detection
    if (trimmedContent.includes(".class") || 
        trimmedContent.includes("{") && trimmedContent.includes("}")) {
        return "CSS";
    }
    
    // SQL detection
    if (trimmedContent.includes("SELECT") || 
        trimmedContent.includes("FROM") ||
        trimmedContent.includes("WHERE")) {
        return "SQL";
    }
    
    return "LanguageFind";
};

function detectFramework(content: string): string {
    if (!content) return "frameWorkFind";
    
    const trimmedContent = content.trim();
    
    // React detection
    if (trimmedContent.includes("import React") || 
        trimmedContent.includes("useState") || 
        trimmedContent.includes("useEffect") ||
        trimmedContent.includes("import { useState") ||
        trimmedContent.includes("import { useEffect")) {
        return "React";
    }
    
    // Next.js detection (React + Next.js specific)
    if (trimmedContent.includes("import Next") || 
        trimmedContent.includes("export default") || 
        trimmedContent.includes("getServerSideProps") ||
        trimmedContent.includes("getStaticProps")) {
        return "Next.js";
    }
    
    // Vue detection
    if (trimmedContent.includes("import Vue") || 
        trimmedContent.includes("<template>") ||
        trimmedContent.includes("export default") && 
        trimmedContent.includes("data:") ||
        trimmedContent.includes("methods:")) {
        return "Vue";
    }
    
    // Angular detection
    if (trimmedContent.includes("@Component") || 
        trimmedContent.includes("import { Component") ||
        trimmedContent.includes("constructor(") && 
        trimmedContent.includes("Inject")) {
        return "Angular";
    }
    
    // Svelte detection
    if (trimmedContent.includes("import { onMount") || 
        trimmedContent.includes("$: ") ||
        trimmedContent.includes("<script>") ||
        trimmedContent.includes("export let ")) {
        return "Svelte";
    }
    
    // JavaScript detection
    if (trimmedContent.includes("function ") || 
        trimmedContent.includes("const ") || 
        trimmedContent.includes("let ") || 
        trimmedContent.includes("var ") ||
        trimmedContent.includes("=>") ||
        trimmedContent.includes("document.") ||
        trimmedContent.includes("window.")) {
        return "JavaScript";
    }
    
    // Web Platform detection
    if (trimmedContent.includes("fetch(") || 
        trimmedContent.includes("XMLHttpRequest") ||
        trimmedContent.includes("addEventListener") ||
        trimmedContent.includes("localStorage") ||
        trimmedContent.includes("sessionStorage")) {
        return "Web Platform";
    }
    
    // GraphQL detection
    if (trimmedContent.includes("gql`") || 
        trimmedContent.includes("graphql") ||
        trimmedContent.includes("query ") ||
        trimmedContent.includes("mutation ")) {
        return "GraphQL";
    }
    
    // Hono detection
    if (trimmedContent.includes("import { Hono }") || 
        trimmedContent.includes("new Hono()") ||
        trimmedContent.includes("app.get(") ||
        trimmedContent.includes("app.post(")) {
        return "Hono";
    }
    
    // ShadCN detection
    if (trimmedContent.includes("import { Button") || 
        trimmedContent.includes("import { Card") ||
        trimmedContent.includes("import { Input") ||
        trimmedContent.includes("cn(") ||
        trimmedContent.includes("clsx(")) {
        return "ShadCN";
    }
    
    // Node.js detection (for server-side JavaScript)
    if (trimmedContent.includes("require(") || 
        trimmedContent.includes("module.exports") ||
        trimmedContent.includes("process.env")) {
        return "Node.js";
    }
    
    // Express.js detection
    if (trimmedContent.includes("app.get(") || 
        trimmedContent.includes("app.post(") ||
        trimmedContent.includes("express()")) {
        return "Express.js";
    }
    
    // Tailwind CSS detection
    if (trimmedContent.includes("class=") && 
        trimmedContent.includes("bg-") ||
        trimmedContent.includes("text-") ||
        trimmedContent.includes("p-") ||
        trimmedContent.includes("m-")) {
        return "Tailwind CSS";
    }
    
    return "frameWorkFind";
}


function detectInFunction (Lines: string[], currentLine: number): boolean {
    for (let i = currentLine-1; i >= 0; i--){
        const line =Lines[i]
        if (line?.match(/^\s*(function|def|const\s+\w+\s*=|let\s+\w\s*=)/)) return true
        if(line?.match(/^\s*}/)) break
    }
    return false
}

function detectInClass(Lines: string[], currentLine: number): boolean {
    for (let i = currentLine - 1 ; i >= 0; i--)
    {
        const line = Lines[i]
        if (line?.match(/^\s*(class|interface)\s+/)) return true 
    }
    return false
}

function detectAfterComment(line: string, column: number): boolean {
    if (!line || column < 0) return false;
    
    const beforeCursor = line.substring(0, column);
    
    // Check for both JavaScript/TypeScript style comments (//) and Python style comments (#)
    return /\/\//.test(beforeCursor) || /#/.test(beforeCursor);
    }

function detectIncompletePatterns(line: string, column: number): string[] {
    if (!line || column < 0 || column > line.length) return [];
    
    const beforeCursor = line.substring(0, column);
    const patterns: string[] = [];

    // Check for incomplete conditional statements
    if (/^\s*(if|while|for|switch)\s*\($/.test(beforeCursor.trim())) {
        patterns.push("conditional");
    }

    // Check for incomplete function declarations
    if (/^\s*(function|const|let|var)\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\($/.test(beforeCursor.trim())) {
        patterns.push("function-declaration");
    }

    // Check for incomplete object literals
    if (/^\s*{\s*$/.test(beforeCursor.trim())) {
        patterns.push("object-literal");
    }

    // Check for incomplete array literals
    if (/^\s*\[\s*$/.test(beforeCursor.trim())) {
        patterns.push("array-literal");
    }

    // Check for incomplete class declarations
    if (/^\s*(class)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*{/.test(beforeCursor.trim())) {
        patterns.push("class-declaration");
    }

    // Check for incomplete try-catch blocks
    if (/^\s*(try|catch|finally)\s*\{/.test(beforeCursor.trim())) {
        patterns.push("try-catch");
    }

    // Check for incomplete import statements
    if (/^\s*(import|export)\s+/.test(beforeCursor.trim())) {
        patterns.push("import-statement");
    }

    // Check for incomplete method calls
    if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\.\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\($/.test(beforeCursor.trim())) {
        patterns.push("method-call");
    }

    // Check for incomplete object property access
    if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\.\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*$/.test(beforeCursor.trim())) {
        patterns.push("object-property");
    }

    // Check for incomplete array access
    if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\[\s*$/.test(beforeCursor.trim())) {
        patterns.push("array-access");
    }

    // Check for incomplete function calls
    if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*\($/.test(beforeCursor.trim())) {
        patterns.push("function-call");
    }

    // Check for incomplete template literals
    if (/`[^`]*$/.test(beforeCursor)) {
        patterns.push("template-literal");
    }

    // Check for incomplete string literals
    if (/["'][^"']*$/g.test(beforeCursor)) {
        patterns.push("string-literal");
    }

    // Check for incomplete parentheses
    if (/\([^)]*$/.test(beforeCursor)) {
        patterns.push("parentheses");
    }

    // Check for incomplete brackets
    if (/\[[^\]]*$/.test(beforeCursor)) {
        patterns.push("brackets");
    }

    // Check for incomplete braces
    if (/\{[^}]*$/.test(beforeCursor)) {
        patterns.push("braces");
    }

    // Check for incomplete arrow functions
    if (/^\s*\(.*\)\s*=>\s*$/.test(beforeCursor.trim())) {
        patterns.push("arrow-function");
    }

    // Check for incomplete async functions
    if (/^\s*(async\s+function|async)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\($/.test(beforeCursor.trim())) {
        patterns.push("async-function");
    }

    // Check for incomplete ternary operator
    if (/^\s*.*\s*\?\s*$/.test(beforeCursor.trim())) {
        patterns.push("ternary-operator");
    }

    // Check for incomplete assignment
    if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*$/.test(beforeCursor.trim())) {
        patterns.push("assignment");
    }

    // Check for incomplete variable declaration
    if (/^\s*(let|const|var)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*$/.test(beforeCursor.trim())) {
        patterns.push("variable-declaration");
    }

    // Check for incomplete for-of loop
    if (/^\s*(for\s+of)\s+/.test(beforeCursor.trim())) {
        patterns.push("for-of-loop");
    }

    // Check for incomplete for-in loop
    if (/^\s*(for\s+in)\s+/.test(beforeCursor.trim())) {
        patterns.push("for-in-loop");
    }

    return patterns;
    }


function getLastNonEmptyLine(Lines: string[], currentLine: number): string{
    for (let i = currentLine -1; i>= 0; i--){
        const line= Lines[i]
        if (line.trim() !== "") return line
    }
    return ""
}







