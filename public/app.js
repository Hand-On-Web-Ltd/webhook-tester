let hookId = null;

async function createHook() {
  const res = await fetch('/api/hooks', { method: 'POST' });
  const data = await res.json();
  hookId = data.id;

  const fullUrl = `${window.location.origin}/hook/${hookId}`;
  document.getElementById('hook-url').value = fullUrl;
  document.getElementById('hook-info').classList.remove('hidden');
  document.getElementById('create-btn').textContent = 'Create Another';

  // Connect SSE
  const evtSource = new EventSource(`/api/hooks/${hookId}/stream`);
  evtSource.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'request') {
      addRequestCard(msg.data);
    }
  };
}

function copyUrl() {
  const input = document.getElementById('hook-url');
  input.select();
  document.execCommand('copy');
}

function addRequestCard(req) {
  const container = document.getElementById('requests');
  const card = document.createElement('div');
  card.className = 'request-card';

  const time = new Date(req.timestamp).toLocaleTimeString();
  const methodClass = `method-${req.method}`;

  let bodyContent = '';
  if (req.body && typeof req.body === 'object') {
    bodyContent = JSON.stringify(req.body, null, 2);
  } else if (req.body) {
    bodyContent = String(req.body);
  } else {
    bodyContent = '(empty)';
  }

  const queryStr = Object.keys(req.query || {}).length
    ? JSON.stringify(req.query, null, 2)
    : null;

  card.innerHTML = `
    <div class="request-header" onclick="this.nextElementSibling.classList.toggle('open')">
      <div><span class="method-badge ${methodClass}">${req.method}</span></div>
      <span class="request-time">${time}</span>
    </div>
    <div class="request-body">
      ${queryStr ? `<h4>Query Parameters</h4><pre>${queryStr}</pre>` : ''}
      <h4>Headers</h4>
      <pre>${JSON.stringify(req.headers, null, 2)}</pre>
      <h4>Body</h4>
      <pre>${bodyContent}</pre>
    </div>`;

  container.prepend(card);
}
