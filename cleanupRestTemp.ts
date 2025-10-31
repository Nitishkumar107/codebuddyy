// D:\vscodedata\codebuddy\verify-deletion.ts
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function verifyDeletion() {
    try {
        console.log('Verifying deletion...');
        
        // Count all playground records
        const count = await db.playground.count();
        console.log(`Total playground records: ${count}`);
        
        if (count === 0) {
            console.log('✅ Success! All playground records have been deleted.');
        } else {
            // Show the actual records
            const records = await db.playground.findMany({
                select: {
                    id: true,
                    title: true,
                    template: true
                }
            });
            
            console.log('Remaining records:');
            records.forEach(record => {
                console.log(`- ID: ${record.id}, Title: ${record.title}, Template: ${record.template}`);
            });
        }
    } catch (error) {
        console.error('Error verifying deletion:', error);
    } finally {
        await db.$disconnect();
    }
}

verifyDeletion();
