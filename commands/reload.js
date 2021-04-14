module.exports = {
    name: 'reload',
    description: '[개발자용] 명령어를 재시작합니다.',
    usage: '[command name]',
    execute(message, args) {
        if (!args.length) return message.channel.send(`재시작 할 명령어를 입력하지 않았습니다., ${message.author}!`);
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`해당 명령어는 없습니다. \`${commandName}\`, ${message.author}!`);
       
        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.error(error);
            message.channel.send(`명령어를 재시작하는 중에 오류가 발생했습니다. \`${command.name}\`:\n\`${error.message}\``);
        }
    },
};