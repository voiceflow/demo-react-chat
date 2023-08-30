import { plugin } from './plugin';

window.vfplugin = Object.assign(window.vfplugin ?? {}, {
  [plugin.name]: plugin,
});
