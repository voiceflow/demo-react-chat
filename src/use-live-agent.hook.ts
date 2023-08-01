import { FetchClient } from '@voiceflow/fetch';
import { TurnType, useRuntime } from '@voiceflow/react-chat';
import { serializeToText } from '@voiceflow/slate-serializer/text';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';

import { LiveAgentPlatform } from '../shared/live-agent-platform.enum';
import { SocketEvent } from '../shared/socket-event.enum';
import { RuntimeContext } from './context';

const SESSION_USER_ID_KEY = 'session:user_id';
const SESSION_CONVERSATION_ID_KEY = 'session:conversation_id';

const client = new FetchClient({ baseURL: 'http://localhost:9099' });

const createTurn = <Type extends TurnType>(type: Type) => ({
  type,
  id: `${Math.random()}-${Date.now()}`,
  timestamp: Date.now(),
});

const extractHistory = (runtime: ReturnType<typeof useRuntime>) => {
  return runtime.session.turns.flatMap((turn) =>
    match(turn)
      .with({ type: TurnType.USER }, (turn) => ({ author: 'user', text: turn.message }))
      .with({ type: TurnType.SYSTEM }, (turn) =>
        turn.messages.flatMap((message) =>
          match(message)
            .with({ type: 'text' }, (message) => ({
              author: 'bot',
              text: typeof message.text === 'string' ? message.text : serializeToText(message.text),
            }))
            .otherwise(() => [])
        )
      )
      .exhaustive()
  );
};

export const useLiveAgent = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isEnabled, setEnabled] = useState(false);
  const { runtime, subscribe } = useContext(RuntimeContext)!;

  const addSystemMessage = (message: string) =>
    runtime.addTurn({
      ...createTurn(TurnType.SYSTEM),
      messages: [{ type: 'text', text: message }],
    });

  const continueConversation = () => {
    socketRef.current?.close();
    socketRef.current = null;
    runtime.interact({ type: 'continue', payload: null });
  };

  const talkToRobot = () => {
    setEnabled(false);
    addSystemMessage('Returning you to the Voiceflow bot...');
    continueConversation();
  };

  const subscribeToConversation = (platform: LiveAgentPlatform, userID: string, conversationID: string) => {
    socketRef.current = new WebSocket(`ws://localhost:9099/${platform}/user/${userID}/conversation/${conversationID}/socket`);
    socketRef.current.onmessage = (message) => {
      const event = JSON.parse(message.data);

      match(event)
        .with({ type: SocketEvent.LIVE_AGENT_CONNECT }, () => addSystemMessage(`connecting you with ${event.data.agent.name}`))
        .with({ type: SocketEvent.LIVE_AGENT_MESSAGE }, () => addSystemMessage(event.data.message))
        .with({ type: SocketEvent.LIVE_AGENT_DISCONNECT }, () => {
          addSystemMessage(`${event.data.agent.name} has left the chat`);
          talkToRobot();
        })
        .otherwise(() => console.log('unexpected event', event));
    };
  };

  const sendUserReply = async (message: string) => {
    runtime.addTurn({ ...createTurn(TurnType.USER), message });

    socketRef.current?.send(JSON.stringify({ type: SocketEvent.USER_MESSAGE, data: { message } }));
  };

  const talkToAgent = useCallback(
    async (platform: LiveAgentPlatform) => {
      const isPlatformEnabled = await client
        .head(`/${platform}`)
        .then(() => true)
        .catch(() => false);

      if (!isPlatformEnabled) {
        addSystemMessage(
          `Sorry, it appears that ${platform} has not been configured. Make sure to create a "./server/.env" file that contains the environment variable "${platform.toUpperCase()}_TOKEN" and that the value is a valid ${platform} API key. You also should run the server located in "./server" with the "yarn dev" command.`
        );
        continueConversation();
        return;
      }

      setEnabled(true);

      const history = extractHistory(runtime);
      const prevUserID = sessionStorage.getItem(SESSION_USER_ID_KEY);

      const { userID, conversationID } = await client
        .post(`/${platform}/conversation`, {
          json: { userID: prevUserID, history },
        })
        .json<any>();

      sessionStorage.setItem(SESSION_USER_ID_KEY, userID);
      sessionStorage.setItem(SESSION_CONVERSATION_ID_KEY, conversationID);

      subscribeToConversation(platform, userID, conversationID);
    },
    [runtime]
  );

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => subscribe('live_agent', talkToAgent), [talkToAgent]);

  return {
    isEnabled,
    talkToRobot,
    sendUserReply,
  };
};
