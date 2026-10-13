const express = require('express');
const app = express();
app.use(express.json());

const path = require('path');
const { register, metricsMiddleware } = require('./metrics');

app.use(metricsMiddleware);

// Serve frontend
app.use(express.static(path.join(__dirname, '../public')));

// Health endpoints (used by Kubernetes liveness/readiness probes)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/ready', (req, res) => res.status(200).json({ status: 'ready' }));

// Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

let todos = [];
let nextId = 1;

app.get('/todos', (req, res) => res.json(todos));

app.get('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

app.post('/todos', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const todo = { id: nextId++, title, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.put('/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  const { title, done } = req.body;
  if (title !== undefined) todo.title = title;
  if (done !== undefined) todo.done = done;
  res.json(todo);
});

app.delete('/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });
  todos.splice(index, 1);
  res.json({ message: 'Deleted successfully' });
});

app.resetTodos = () => { todos = []; nextId = 1; };

module.exports = app;