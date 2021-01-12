const connection = require("../db/dbSet.js");
const Discord = require("discord.js");

module.exports = {
    name: '1',
    description: 'Crash',
    cooldown: 0.1,
    execute(message, args) {
        
        //connection.query(`INSERT INTO Users (user_id, guild_id, displayname, money_blue, money_orange, level, experience, daily ) VALUES (${message.member.id}, ${message.guild.id}, '${args}', 0, 0, 1, 0, 0)`, err => {
         //   if (err) throw err;
        //});        
        console.log(message.member.displayname);
        console.log(message.author.username);
        console.log(message.guild.member);
        console.log(message.member.user.tag.member.user.id);
        // connection.end();
        //message.channel.send('Bomb!');
    }
}