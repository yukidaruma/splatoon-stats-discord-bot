import * as Discord from 'discord.js';
import { UnimplementedError } from '../errors';

export default class Command {
  constructor(public readonly msg: Discord.Message) {}

  public help?(): string;

  public run(): void {
    throw new UnimplementedError('You must override `run` method for Command.');
  }

  /**
   * Define precondition for command to be executed.
   * If false is returned, command will not be executed.
   */
  public validate?(): boolean;
}
