const request = require('supertest');
const app = require('../src/app');

beforeEach(() => app.resetTodos());

describe('GET /todos', () => {
  it('returns empty list initially', async () => {
    const res = await request(app).get('/todos');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /todos', () => {
  it('creates a new todo', async () => {
    const res = await request(app).post('/todos').send({ title: 'Buy milk' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Buy milk');
    expect(res.body.done).toBe(false);
  });

  it('returns 400 if title is missing', async () => {
    const res = await request(app).post('/todos').send({});
    expect(res.statusCode).toBe(400);
  });
});

describe('PUT /todos/:id', () => {
  it('updates a todo', async () => {
    const created = await request(app).post('/todos').send({ title: 'Learn Jenkins' });
    const res = await request(app)
      .put(`/todos/${created.body.id}`)
      .send({ done: true });
    expect(res.body.done).toBe(true);
  });
});

describe('DELETE /todos/:id', () => {
  it('deletes a todo', async () => {
    const created = await request(app).post('/todos').send({ title: 'Delete me' });
    const res = await request(app).delete(`/todos/${created.body.id}`);
    expect(res.statusCode).toBe(200);
  });

  it('returns 404 for non-existent todo', async () => {
    const res = await request(app).delete('/todos/999');
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /todos/:id', () => {
  it('returns a todo by id', async () => {
    const created = await request(app).post('/todos').send({ title: 'Find me' });
    const res = await request(app).get(`/todos/${created.body.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Find me');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/todos/999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Health and metrics', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /ready returns ready', async () => {
    const res = await request(app).get('/ready');
    expect(res.statusCode).toBe(200);
  });

  it('GET /metrics exposes Prometheus metrics', async () => {
    await request(app).get('/todos');
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('http_requests_total');
    expect(res.text).toContain('http_request_duration_seconds');
  });
});