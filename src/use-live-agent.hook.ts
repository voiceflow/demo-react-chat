import { TurnType, useRuntime } from '@voiceflow/react-chat';
import { useEffect, useRef, useState } from 'react';

const LIVE_AGENT_DELAY = 2000;

export const useLiveAgent = (runtime: ReturnType<typeof useRuntime>) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isEnabled, setEnabled] = useState(false);

  const scheduleSystemReply = (message: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      runtime.addTurn({
        type: TurnType.SYSTEM,
        id: `${Math.random()}-${Date.now()}`,
        timestamp: Date.now(),
        messages: [{ type: 'text', text: message }],
      });
    }, LIVE_AGENT_DELAY);
  };

  const sendUserReply = (message: string) => {
    runtime.addTurn({
      type: TurnType.USER,
      id: `${Math.random()}-${Date.now()}`,
      timestamp: Date.now(),
      message,
    });
    scheduleSystemReply('I am a real person. I understand you and empathize with your plight.');
  };

  const talkToAgent = () => {
    setEnabled(true);
    scheduleSystemReply('I am a real person. How can I help you?');
  };

  const talkToRobot = () => {
    setEnabled(false);
    runtime.addTurn({
      type: TurnType.SYSTEM,
      id: `${Math.random()}-${Date.now()}`,
      timestamp: Date.now(),
      messages: [{ type: 'text', text: '' }],
    });
    runtime.interact({ type: 'continue', payload: null });
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return {
    isEnabled,
    setEnabled,
    talkToAgent,
    talkToRobot,
    sendUserReply,
  };
};
