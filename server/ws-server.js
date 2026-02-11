import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const clients = new Map();
// Map<ws, { room: string, name: string }>

const safeJson = (data) => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const broadcastToRoom = (room, payload, except) => {
  const message = JSON.stringify(payload);
  for (const [client, meta] of clients.entries()) {
    if (client.readyState !== 1) continue;
    if (meta.room !== room) continue;
    if (client === except) continue;
    client.send(message);
  }
};

wss.on('connection', (ws) => {
  clients.set(ws, { room: 'lobby', name: 'Guest' });

  ws.on('message', (data) => {
    const payload = safeJson(data);
    if (!payload || typeof payload !== 'object') return;

    if (payload.type === 'join') {
      const room = (payload.room || 'lobby').toString().trim() || 'lobby';
      const name = (payload.name || 'Guest').toString().trim() || 'Guest';
      clients.set(ws, { room, name });
      ws.send(JSON.stringify({
        type: 'message',
        id: `system-${Date.now()}`,
        room,
        name: 'system',
        text: `Joined #${room}`,
        timestamp: Date.now()
      }));
      return;
    }

    if (payload.type === 'message') {
      const meta = clients.get(ws);
      if (!meta) return;
      const room = (payload.room || meta.room || 'lobby').toString().trim() || 'lobby';
      const name = (payload.name || meta.name || 'Guest').toString().trim() || 'Guest';
      const text = (payload.text || '').toString().trim();
      if (!text) return;

      const message = {
        type: 'message',
        id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        room,
        name,
        text,
        timestamp: payload.timestamp || Date.now()
      };

      broadcastToRoom(room, message, ws);
      return;
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

console.log(`WebSocket server listening on ws://localhost:${PORT}`);
