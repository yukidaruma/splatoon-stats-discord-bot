import * as Discord from 'discord.js';
import * as Log4js from 'log4js';
import { commands } from './commands';

const client = new Discord.Client();

Log4js.configure({
  appenders: {
    stdout: { type: 'stdout' },
    file: { type: 'dateFile', filename: 'logs/app.log', pattern: '.yyyy-MM-dd', daysToKeep: 30 },
  },
  categories: {
    default: {
      appenders: ['stdout', 'file'],
      level:
        process.env.LOG_LEVEL ??
        (process.env.NODE_ENV === 'development' ? Log4js.levels.DEBUG : Log4js.levels.INFO)
          .levelStr,
    },
  },
});
const logger = Log4js.getLogger();

process.on('uncaughtException', function (error) {
  logger.error({ type: 'error.uncaught', error });
});

const state = {
  l: logger,
  user: null as Nullable<Discord.User>,
};

client.on('ready', () => {
  const user = client.user!;
  state.l.info({ type: 'event.logged_in', as: user.tag });

  state.user = user;
});

const commandPattern = /(?:^| )!(\w+)/;
const availableCommands = Object.keys(commands)
  .map((commandName) => `\`!${commandName.toLowerCase()}\``)
  .join(', ');
client.on('message', (msg) => {
  const member = msg.member!;

  // Ignore own messages
  if (msg.member!.id === state.user?.id) {
    state.l.trace({ type: 'event.ignoring_own_message' });
    return;
  }
  state.l.trace({ type: 'event.received_message', from: member.user.tag });

  const isMentioned = (msg: Discord.Message) => {
    const mentioned = msg.mentions.users.first();

    return mentioned && mentioned.id === state.user?.id;
  };

  if (!isMentioned(msg)) {
    state.l.trace({ type: 'event.non_incoming_message' });
    return;
  }

  const content = msg.cleanContent.toLocaleLowerCase();
  const matches = content.match(commandPattern);

  if (matches) {
    const match = matches[1];
    const commandName = match[0].toUpperCase() + match.substring(1);

    state.l.debug({ type: 'event.incoming_message', from: member.user.tag });

    if (!(commandName in commands)) {
      state.l.debug({ type: 'command.invalid', commandName });
      msg.reply(
        `\`!${match}\` is an invalid command. Available commands are: ${availableCommands}.`,
      );
      return;
    }
    const command = new commands[commandName](msg);

    const precondition = !command.validate || command.validate();
    state.l.info({
      type: 'command.precondition',
      commandName,
      hasPrecondition: !!command.validate,
      precondition,
    });
    if (!precondition) {
      // Precondition not met.
      return;
    }

    command.run();
    state.l.debug({ type: 'command.completion', commandName });
  }
});

const { DISCORD_API_TOKEN } = process.env;
if (!DISCORD_API_TOKEN) {
  throw new Error(
    'Environmental variable `DISCORD_API_TOKEN` is not set.\n' +
      'Please set `.env` to connect to Discord API.',
  );
}

client.login(DISCORD_API_TOKEN);
