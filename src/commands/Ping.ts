import Command from './base';

export default class Ping extends Command {
  public run(): void {
    this.msg.reply('Pong');
  }
}
