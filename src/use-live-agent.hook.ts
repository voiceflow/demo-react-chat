import { FetchClient } from '@voiceflow/fetch';
import { SystemResponse, SystemTurnProps, TurnType } from '@voiceflow/react-chat';
import { serializeToText } from '@voiceflow/slate-serializer/text';
import { useContext, useEffect, useRef, useState } from 'react';
import { match } from 'ts-pattern';

import { RuntimeContext } from './context';

const SESSION_USER_ID_KEY = 'session:user_id';
const SESSION_CONVERSATION_ID_KEY = 'session:conversation_id';

const client = new FetchClient({ baseURL: 'http://localhost:9099' });

export const useLiveAgent = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isEnabled, setEnabled] = useState(false);
  const { runtime, subscribe } = useContext(RuntimeContext)!;

  const addSystemReply = (message: string) =>
    runtime.addTurn({
      type: TurnType.SYSTEM,
      id: `${Math.random()}-${Date.now()}`,
      timestamp: Date.now(),
      messages: [{ type: 'text', text: message }],
    });

  const addSystemMessage = (message: SystemTurnProps['messages'][number]) =>
    runtime.addTurn({
      type: TurnType.SYSTEM,
      id: `${Math.random()}-${Date.now()}`,
      timestamp: Date.now(),
      messages: [message],
    });

  const initializeSocket = (userID: string, conversationID: string) => {
    socketRef.current = new WebSocket(`ws://localhost:9099/user/${userID}/conversation/${conversationID}/socket`);
    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      match(message)
        .with({ type: 'conversation:restore' }, () => { })

        .with({ type: 'live_agent:message' }, () => {
          addSystemMessage({ type: SystemResponse.Message.TEXT, text: message.data.message });
        })

        .otherwise(() => {
          console.log('unexpected message', message);
        });
    };
  };

  const sendUserReply = async (message: string) => {
    runtime.addTurn({
      type: TurnType.USER,
      id: `${Math.random()}-${Date.now()}`,
      timestamp: Date.now(),
      message,
    });

    socketRef.current?.send(JSON.stringify({ type: 'user:message', data: { message } }));
  };

  const talkToAgent = async () => {
    setEnabled(true);
    console.log(runtime.session.turns);
    const history = runtime.session.turns.flatMap((turn) =>
      match(turn)
        .with({ type: TurnType.USER }, (turn) => ({
          author: 'user',
          text: turn.message,
        }))
        .with({ type: TurnType.SYSTEM }, (turn) =>
          turn.messages.flatMap((message) =>
            match(message)
              .with({ type: SystemResponse.Message.TEXT }, (message) => ({
                author: 'bot',
                text: typeof message.text === 'string' ? message.text : serializeToText(message.text),
              }))
              .otherwise(() => [])
          )
        )
        .exhaustive()
    );

    const prevUserID = sessionStorage.getItem(SESSION_USER_ID_KEY);

    const { userID, conversationID } = await client
      .post('/conversation', {
        json: { userID: prevUserID, history, turns: runtime.session.turns },
      })
      .json<any>();

    sessionStorage.setItem(SESSION_USER_ID_KEY, userID);
    sessionStorage.setItem(SESSION_CONVERSATION_ID_KEY, conversationID);

    initializeSocket(userID, conversationID);
  };

  const talkToRobot = () => {
    setEnabled(false);
    addSystemReply('Returning you to the Voiceflow bot...');
    runtime.interact({ type: 'continue', payload: null });
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => subscribe('live_agent', talkToAgent), [runtime]);

  return {
    isEnabled,
    setEnabled,
    talkToAgent,
    talkToRobot,
    sendUserReply,
  };
};
