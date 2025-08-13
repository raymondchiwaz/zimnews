import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const source = await prisma.source.upsert({
    where: { name: 'NewsDay' },
    update: {},
    create: { name: 'NewsDay', baseUrl: 'https://newsday.co.zw', affiliation: 'INDEPENDENT' }
  });
  const category = await prisma.category.upsert({
    where: { name: 'Politics' },
    update: {},
    create: { name: 'Politics' }
  });

  for (let i = 1; i <= 5; i++) {
    await prisma.article.create({
      data: {
        headline: `Seed Headline ${i}`,
        url: `https://example.com/${i}`,
        snippet: 'Seed snippet',
        publishedAt: new Date(Date.now() - i * 3600000),
        sourceId: source.id,
        categoryId: category.id
      }
    });
  }
  console.log('Seeded successfully');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
