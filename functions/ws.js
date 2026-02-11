const rooms = new Map();
// Map<string, Set<WebSocket>>

const getRoom = (name) => {
  if (!rooms.has(name)) {
    rooms.set(name, new Set());
  }
  return rooms.get(name);
};

const parseRoom = (requestUrl) => {
  const room = new URL(requestUrl).searchParams.get("room") || "lobby";
  const sanitized = room.toString().trim().replace(/\s+/g, "-").slice(0, 64);
  return sanitized || "lobby";
};

const parsePayload = (message) => {
  try {
    const parsed = JSON.parse(message);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}
  return null;
};

const broadcast = (roomSockets, payload, sender) => {
  const data = JSON.stringify(payload);
  for (const socket of roomSockets) {
    if (socket === sender) continue;
    try {
      socket.send(data);
    } catch {
      roomSockets.delete(socket);
    }
  }
};

export async function onRequest(context) {
  const request = context.request;
  const upgrade = request.headers.get("Upgrade");

  if (!upgrade || upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const roomName = parseRoom(request.url);
  const roomSockets = getRoom(roomName);
  const pair = new WebSocketPair();
  const client = pair[0];
  const server = pair[1];

  server.accept();
  roomSockets.add(server);

  server.addEventListener("message", (event) => {
    const payload = parsePayload(event.data);
    if (!payload || payload.type !== "message") return;
    const message = {
      type: "message",
      id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      room: roomName,
      name: (payload.name || "Guest").toString().slice(0, 32),
      text: (payload.text || "").toString().slice(0, 1000),
      timestamp: payload.timestamp || Date.now(),
    };
    if (!message.text.trim()) return;
    broadcast(roomSockets, message, server);
  });

  const cleanup = () => {
    roomSockets.delete(server);
    if (roomSockets.size === 0) {
      rooms.delete(roomName);
    }
  };

  server.addEventListener("close", cleanup);
  server.addEventListener("error", cleanup);

  return new Response(null, { status: 101, webSocket: client });
}
