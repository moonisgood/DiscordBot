const Discord = require('discord.js');
const fs = require('fs');
const { prefix, token } = require('./config.js');
const connection = require("./db/dbSet.js");

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

connection.connect(function (err) {
    if (err) throw err;
    console.log("Mysql Connected successfully");
})

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('League of Legends', { type: 'WATCHING' });
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const user = getUserFromMention(args[0]);
    if(user)
        args[0] = user;

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('이 명령어는 DM에서 사용할 수 없습니다.');
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`\`${command.name}\` 명령어를 사용하려면 \`${timeLeft.toFixed(1)}\` 초를 더 기다려야 합니다.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
	    command.execute(message, args);
    } catch (error) {
	    console.error(error);
	    message.reply('there was an error trying to execute that command!');
    }
});

function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

client.login(token);