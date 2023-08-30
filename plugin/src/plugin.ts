// eslint-disable-next-line import/no-relative-packages
import { Plugin } from '../../shared/plugin.interface';
import { TetrisComponent } from './TetrisComponent';

export const plugin: Plugin = {
  name: 'tetris',
  Message: TetrisComponent,
};
