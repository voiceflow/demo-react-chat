import { CustomMessage } from '../custom-message.enum';
import { Trace } from './types';

const PREFIX = 'plugin:';

export const PluginTrace: Trace = {
  canHandle: ({ type }) => String(type).startsWith(PREFIX),
  handle: ({ context }, trace) => {
    const name = String(trace.type).slice(PREFIX.length);

    const plugin = window.vfplugin?.[name];

    if (plugin?.Message) {
      context.messages.push({ type: CustomMessage.PLUGIN, payload: { Message: plugin.Message } });
    } else {
      context.messages.push({
        type: 'text',
        text: `There is no plugin registered with the name "${name}". Make sure to run "yarn build" in the "./plugin" folder.`,
      });
    }

    return context;
  },
};
