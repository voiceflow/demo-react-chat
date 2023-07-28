import { useRuntime } from '@voiceflow/react-chat';
import { createNanoEvents } from 'nanoevents';
import { createContext, useMemo } from 'react';

import { AccountInfoTrace } from './traces/account-info.trace';
import { CalendarTrace } from './traces/calendar.trace';
import { TalkToAgentTrace } from './traces/talk-to-agent.trace';
import { VideoTrace } from './traces/video.trace';

export interface RuntimeEvents {
  live_agent: () => void;
}

export interface RuntimeContextValue {
  runtime: ReturnType<typeof useRuntime>;
  subscribe: <K extends keyof RuntimeEvents>(event: K, callback: RuntimeEvents[K]) => void;
}

export const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export const RuntimeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const emitter = useMemo(() => createNanoEvents<RuntimeEvents>(), []);
  const runtime = useRuntime({
    verify: { authorization: import.meta.env.VF_DM_API_KEY },
    session: { userID: `anonymous-${Math.random()}` },
    traces: [AccountInfoTrace, CalendarTrace, VideoTrace, TalkToAgentTrace(() => emitter.emit('live_agent'))],
  });

  const subscribe = (event: keyof RuntimeEvents, callback: (data?: unknown) => void) => emitter.on(event, callback);

  return <RuntimeContext.Provider value={{ runtime, subscribe }}>{children}</RuntimeContext.Provider>;
};
