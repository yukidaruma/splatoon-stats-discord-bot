import Command from './base';
import Ping from './Ping';

const commands: { [name: string]: typeof Command } = { Ping };

export { commands };
