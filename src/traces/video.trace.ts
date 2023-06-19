import { CustomMessage } from '../custom-message.enum';
import { Trace } from './types';

export const VideoTrace: Trace = {
  canHandle: ({ type }) => type === 'video',
  handle: ({ context }, trace) => {
    context.messages.push({ type: CustomMessage.VIDEO, payload: trace.payload });
    return context;
  },
};
