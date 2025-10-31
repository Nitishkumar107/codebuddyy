// D:\vscodedata\codebuddy\cleanup.ts
// Create a cleanup script file
import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const db = new PrismaClient();

async function cleanupInvalidTemplates() {
    try {
        console.log('Starting template cleanup...');
        
        // Find playgrounds with invalid template values
        const invalidPlaygrounds = await db.playground.findMany({
            where: {
                template: {
                    notIn: [
                        'REACTJS', 'NEXTJS', 'EXPRESS', 'VUE', 'ANGULAR', 'SHADCN',
                        'GRAPHQL', 'HONO', 'NEXT', 'SVELTE', 'JsonGraphqlServer',
                        'JavaScript', 'WebPlatform'
                    ]
                }
            }
        });

        console.log(`Found ${invalidPlaygrounds.length} invalid playgrounds`);

        if (invalidPlaygrounds.length > 0) {
            // Update them to a default template
            for (const playground of invalidPlaygrounds) {
                console.log(`Updating playground ${playground.id} from ${playground.template} to REACTJS`);
                
                await db.playground.update({
                    where: { id: playground.id },
                    data: { 
                        template: 'REACTJS' // Update to valid template
                    }
                });
            }
            
            console.log('Template cleanup completed successfully!');
        } else {
            console.log('No invalid templates found.');
        }
    } catch (error) {
        console.error('Error cleaning up templates:', error);
    } finally {
        // Close the database connection
        await db.$disconnect();
    }
}

// Run the cleanup
cleanupInvalidTemplates();
