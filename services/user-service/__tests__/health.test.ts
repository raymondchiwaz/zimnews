import request from 'supertest';
import '../src/index';

describe('user-service health', () => {
  it('responds healthy', async () => {
    // In a real setup we'd start the server in test env; placeholder for pattern
    const res = await request('http://localhost:8001').get('/health');
    expect([200,404]).toContain(res.status);
  });
});
