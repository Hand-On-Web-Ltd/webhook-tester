# Webhook Tester

A simple tool for testing and debugging webhooks. Spin it up, get a unique URL, and see every incoming request in real-time — method, headers, body, and timestamp.

Perfect for debugging n8n workflows, Zapier zaps, Stripe webhooks, or any API integration.

## Features

- **Unique webhook URLs** — Each session gets its own endpoint
- **Real-time updates** — See requests as they arrive via Server-Sent Events
- **Full request details** — Method, headers, body, query params, timestamp
- **No signup needed** — Run locally, everything stays on your machine
- **Clean UI** — Dark theme, easy to read

## Quick Start

```bash
git clone https://github.com/Hand-On-Web-Ltd/webhook-tester.git
cd webhook-tester
npm install
npm start
```

Open `http://localhost:3000` in your browser. You'll get a unique webhook URL. Send requests to it and watch them appear.

## How It Works

1. The server generates a unique ID for your session
2. Your webhook URL is `http://localhost:3000/hook/{your-id}`
3. Any request to that URL gets stored and pushed to your browser via SSE
4. The frontend shows each request with all its details

## Testing It

```bash
# Send a test POST
curl -X POST http://localhost:3000/hook/YOUR_ID \
  -H "Content-Type: application/json" \
  -d '{"test": true, "message": "hello"}'

# Send a GET with query params
curl "http://localhost:3000/hook/YOUR_ID?foo=bar&baz=123"
```

## About Hand On Web
We build AI chatbots, voice agents, and automation tools for businesses.
- 🌐 [handonweb.com](https://www.handonweb.com)
- 📧 outreach@handonweb.com
- 📍 Chester, UK

## Licence
MIT
