import { Trace } from './types';

export const AccountInfoTrace: Trace = {
  canHandle: ({ type }) => type === 'account_info',
  handle: ({ context }, trace) => {
    const { status, balance, created_at } = JSON.parse(trace.payload);

    context.messages.push({
      type: 'text',
      text: `You have a ${status} account with ${balance} in your balance. Your account was created on ${new Date(created_at).toLocaleDateString()}`,
    });
    return context;
  },
};
