
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Fixing Question Content ---');

    // 1. Fix "Kanade's Perfect Multiples"
    const q = await prisma.question.findFirst({
        where: { title: { contains: "Kanade's Perfect Multiples" } }
    });

    if (q) {
        console.log(`Found question: ${q.title} (${q.id})`);
        const newContent = `You are given an array $A$ of $N$ integers. A subarray is called **perfect** if the product of all elements in the subarray is a multiple of $K$.

Find the number of perfect subarrays.

### Input
- The first line contains two integers $N$ ($1 \\le N \\le 2 \\cdot 10^5$) and $K$ ($1 \\le K \\le 10^9$).
- The second line contains $N$ integers $A_1, A_2, \\dots, A_N$ ($1 \\le A_i \\le 10^9$).

### Output
Print a single integer — the number of perfect subarrays.

### Example
**Input**
\`\`\`
5 6
2 3 4 5 6
\`\`\`

**Output**
\`\`\`
9
\`\`\`

### Note
A subarray is defined as a contiguous segment of the array.`;

        await prisma.question.update({
            where: { id: q.id },
            data: {
                problemStatement: newContent,
                content: newContent
            }
        });
        console.log('✅ Updated "Kanade\'s Perfect Multiples" with full text.');
    } else {
        console.log('⚠️ Question "Kanade\'s Perfect Multiples" not found.');
    }

    // 2. Check for other link-only questions
    console.log('\n--- Checking for other link-only questions ---');
    const linkQuestions = await prisma.question.findMany({
        where: {
            OR: [
                { problemStatement: { contains: "http" } },
                { problemStatement: { contains: "www." } }
            ]
        },
        select: { id: true, title: true, problemStatement: true }
    });

    if (linkQuestions.length > 0) {
        console.log(`Found ${linkQuestions.length} other questions possibly containing links:`);
        linkQuestions.forEach(lq => {
            console.log(`- ${lq.title}: ${lq.problemStatement.substring(0, 50)}...`);
        });
    } else {
        console.log('No other questions with links found.');
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
