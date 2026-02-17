type NotificationClient = {
  id: string;
  send: (data: unknown) => void;
};

const clients = new Map<string, NotificationClient>();

export function addClient(client: NotificationClient) {
  clients.set(client.id, client);
  console.log(`[SSE] Client connected: ${client.id}. Total: ${clients.size}`);
}

export function removeClient(clientId: string) {
  clients.delete(clientId);
  console.log(`[SSE] Client disconnected: ${clientId}. Total: ${clients.size}`);
}

export function broadcastNotification(notification: unknown) {
  const data = JSON.stringify({ type: "notification", data: notification });
  clients.forEach((client) => {
    try {
      client.send(data);
    } catch (error) {
      console.error(`[SSE] Failed to send to ${client.id}:`, error);
      clients.delete(client.id);
    }
  });
}

export function broadcastUnreadCount(count: number) {
  const data = JSON.stringify({ type: "unreadCount", data: count });
  clients.forEach((client) => {
    try {
      client.send(data);
    } catch (error) {
      clients.delete(client.id);
    }
  });
}

export function getConnectedClientsCount() {
  return clients.size;
}