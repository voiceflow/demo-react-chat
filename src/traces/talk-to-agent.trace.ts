import { Trace } from './types';

export const TalkToAgentTrace = (handoff: () => void): Trace => ({
  canHandle: ({ type }) => type === 'talk_to_agent',
  handle: ({ context }) => {
    handoff();
    return context;
  },
});
