const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  try {
    const src = await p.source.upsert({
      where: { name: 'NewsDay' },
      update: {},
      create: { name: 'NewsDay', baseUrl: 'https://newsday.co.zw', affiliation: 'INDEPENDENT' }
    });
    const cat = await p.category.upsert({
      where: { name: 'Politics' },
      update: {},
      create: { name: 'Politics' }
    });
    for (let i = 1; i <= 5; i++) {
      await p.article.create({
        data: {
          headline: ,
            url: ,
            snippet: 'Seed snippet',
            publishedAt: new Date(Date.now() - i * 3600000),
            sourceId: src.id,
            categoryId: cat.id
        }
      });
    }
    console.log('Seeded successfully');
  } catch (e) {
    console.error('Seed error', e);
  } finally {
    await p.();
  }
})();
