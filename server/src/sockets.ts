export enum SocketEvent {
  // server-sent events
  LIVE_AGENT_CONNECT = 'live_agent.connect',
  LIVE_AGENT_DISCONNECT = 'live_agent.disconnect',
  LIVE_AGENT_MESSAGE = 'live_agent.message',

  // client-sent events
  USER_MESSAGE = 'user.message',
}

export const connectLiveAgent = (conversation: any, agent: any) => ({
  type: SocketEvent.LIVE_AGENT_CONNECT,
  data: { conversation, agent },
});

export const disconnectLiveAgent = (conversation: any, agent: any) => ({
  type: SocketEvent.LIVE_AGENT_DISCONNECT,
  data: { conversation, agent },
});

export const sendLiveAgentMessage = (message: string) => ({
  type: SocketEvent.LIVE_AGENT_MESSAGE,
  data: { message },
});
