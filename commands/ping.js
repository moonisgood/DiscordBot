module.exports = {
    name: 'ping',
    aliases: ['ping2', 'ping3'],
    description: 'Ping!',
    cooldown: 5,
    execute(message, args) {
        message.channel.send('Pong.');
    }
}