import request from 'supertest';
import nock from 'nock';
import app from '../src/index';

describe('API Gateway proxy contract', () => {
  afterEach(() => { nock.cleanAll(); });

  it('proxies /api/users/login to user service', async () => {
    const scope = nock(process.env.USER_SERVICE_URL || 'http://localhost:8001')
      .post('/login')
      .reply(200, { token: 'fake-jwt' });

    const res = await request(app)
      .post('/api/users/login')
      .send({ identifier: 'user', password: 'pass' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe('fake-jwt');
    expect(scope.isDone()).toBe(true);
  });

  it('proxies /api/search to article service', async () => {
    const scope = nock(process.env.ARTICLE_SERVICE_URL || 'http://localhost:8002')
      .get('/search')
      .query(true)
      .reply(200, [{ id: '1', title: 'Test', excerpt: '', source: 'NewsDay', publishedAt: new Date().toISOString(), category: 'Politics' }]);

    const res = await request(app)
      .get('/api/search?q=test');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(scope.isDone()).toBe(true);
  });
});
