import * as Discord from 'discord.js';
import { commands } from './commands';

const client = new Discord.Client();

const state = {
  user: null as Nullable<Discord.User>,
};

client.on('ready', () => {
  const user = client.user!;
  state.user = user;

  console.log(`Logged in as ${user.tag}!`);
});

const commandPattern = /(?:^| )!(\w+)/;

client.on('message', (msg) => {
  // Ignore own messages
  if (msg.member!.id === state.user?.id) {
    return;
  }

  const isMentioned = (msg: Discord.Message) => {
    const mentioned = msg.mentions.users.first();

    return mentioned && mentioned.id === state.user?.id;
  };

  if (!isMentioned(msg)) {
    return;
  }

  const content = msg.cleanContent.toLocaleLowerCase();
  const matches = content.match(commandPattern);

  if (matches) {
    const match = matches[1];
    const commandName = match[0].toUpperCase() + match.substring(1);
    const command = new commands[commandName](msg);

    if (command.validate && !command.validate()) {
      // Precondition not met.
      return;
    }

    command.run();
  }
});

const { DISCORD_API_TOKEN } = process.env;
if (!DISCORD_API_TOKEN) {
  throw new Error(
    'Environmental variable `DISCORD_API_TOKEN` is not set.\n' +
      'Please set `.env` to connect to Discord API',
  );
}

client.login(DISCORD_API_TOKEN);
