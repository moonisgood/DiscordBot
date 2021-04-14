const { prefix } = require('../config.js');

module.exports = {
    name: 'help',
    description: '해당 봇의 명령어를 보여줍니다.',
    aliases: ['commands','도움말','명령어'],
    usage: '[command name]',
    cooldown: 3,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('명령어 목록:');
            data.push(commands.map(command => command.name).join(', '));
            data.push(`\n\`${prefix}help [command name]\`를 통해 명령어의 자세한 정보를 확인할 수 있습니다.`);

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.reply('개인 메세지로 모든 명령어를 보내드렸어요!');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('개인 메시지를 보낼 수 없어요. 개인 메시지를 허용해주세요.');
                });
        }

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('유효한 명령어가 아니에요.');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

        message.channel.send(data, { split: true });
    },
};