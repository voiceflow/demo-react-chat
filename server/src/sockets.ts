import { WebSocket } from 'ws';

enum SocketEvent {
  CONVERSATION_RESTORE = 'conversation:restore',
  LIVE_AGENT_ASSIGN = 'live_agent:assign',
  LIVE_AGENT_CONNECT = 'live_agent:connect',
  LIVE_AGENT_DISCONNECT = 'live_agent:disconnect',
  LIVE_AGENT_MESSAGE = 'live_agent:message',
}

export const restoreConversation = (ws: WebSocket, conversation: any) =>
  ws.send(JSON.stringify({ type: SocketEvent.CONVERSATION_RESTORE, data: { conversation } }));

export const assignLiveAgent = (ws: WebSocket, conversation: any) =>
  ws.send(JSON.stringify({ type: SocketEvent.LIVE_AGENT_ASSIGN, data: { conversation } }));

export const connectLiveAgent = (ws: WebSocket, conversation: any) =>
  ws.send(JSON.stringify({ type: SocketEvent.LIVE_AGENT_CONNECT, data: { conversation } }));

export const disconnectLiveAgent = (ws: WebSocket, conversation: any) =>
  ws.send(JSON.stringify({ type: SocketEvent.LIVE_AGENT_DISCONNECT, data: { conversation } }));

export const sendLiveAgentMessage = (ws: WebSocket, message: string) =>
  ws.send(JSON.stringify({ type: SocketEvent.LIVE_AGENT_MESSAGE, data: { message } }));
