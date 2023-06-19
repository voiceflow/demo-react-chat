import { CustomMessage } from '../custom-message.enum';
import { Trace } from './types';

export const CalendarTrace: Trace = {
  canHandle: ({ type }) => type === 'calendar',
  handle: ({ context }, trace) => {
    context.messages.push({ type: CustomMessage.CALENDAR, payload: JSON.parse(trace.payload) });
    return context;
  },
};
