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