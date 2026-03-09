const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.text({ limit: '1mb' }));
app.use(express.raw({ limit: '1mb', type: '*/*' }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Store hooks and their requests
const hooks = new Map();
// SSE clients per hook
const clients = new Map();

// Create a new hook
app.post('/api/hooks', (req, res) => {
  const id = crypto.randomBytes(8).toString('hex');
  hooks.set(id, []);
  clients.set(id, []);
  res.json({ id, url: `/hook/${id}` });
});

// SSE stream for a hook
app.get('/api/hooks/:id/stream', (req, res) => {
  const { id } = req.params;
  if (!hooks.has(id)) {
    hooks.set(id, []);
    clients.set(id, []);
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  res.write('data: {"type":"connected"}\n\n');

  const clientList = clients.get(id);
  clientList.push(res);

  req.on('close', () => {
    const idx = clientList.indexOf(res);
    if (idx > -1) clientList.splice(idx, 1);
  });
});

// Get stored requests for a hook
app.get('/api/hooks/:id/requests', (req, res) => {
  const requests = hooks.get(req.params.id) || [];
  res.json(requests);
});

// Catch all webhook hits
app.all('/hook/:id', (req, res) => {
  const { id } = req.params;
  if (!hooks.has(id)) hooks.set(id, []);
  if (!clients.has(id)) clients.set(id, []);

  let body = req.body;
  if (Buffer.isBuffer(body)) body = body.toString('utf8');

  const entry = {
    id: crypto.randomUUID(),
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: body,
    timestamp: new Date().toISOString(),
    ip: req.ip,
  };

  const requests = hooks.get(id);
  requests.unshift(entry);
  if (requests.length > 100) requests.pop();

  // Push to SSE clients
  const sseData = JSON.stringify({ type: 'request', data: entry });
  const clientList = clients.get(id) || [];
  clientList.forEach(client => {
    client.write(`data: ${sseData}\n\n`);
  });

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Webhook Tester running on http://localhost:${PORT}`);
});
