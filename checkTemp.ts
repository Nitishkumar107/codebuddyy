// D:\vscodedata\codebuddy\check-templates.ts
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function checkAllTemplates() {
    try {
        console.log('Checking all existing template values...');
        
        // Get all distinct template values from the database
        const templateValues = await db.playground.groupBy({
            by: ['template'],
            _count: {
                _all: true
            }
        });

        console.log('All template values found in database:');
        templateValues.forEach(item => {
            console.log(`- ${item.template}: ${item._count._all} records`);
        });

    } catch (error) {
        console.error('Error checking templates:', error);
    } finally {
        await db.$disconnect();
    }
}

checkAllTemplates();
