const Discord = require("discord.js");
const connection = require("../db/dbSet.js");

var dbManager = {};

dbManager.UserCreatedCheck = function(message, args) {
    connection.query(`INSERT INTO Users (user_id, guild_id, daily, daily_check) VALUES ('${message.member.id}', '${message.guild.id}' 0, '1004')`);
    embedMsg(message, args);
};

dbManager.TiersCreatedCheck = function(message, args) {
    connection.query(`INSERT INTO Tiers (user_id, guild_id, civilwar_tier, civilwar_points) VALUES ('${message.member.id}', '${message.guild.id}', 0, '0')`);
    embedMsg(message, args);
};

var embedMsg = function(message, args) {
    const embedMsg = new Discord.MessageEmbed()
        .setColor('#ff0000')
        .addField('시스템', '데이터가 없어 추가합니다. 명령어를 다시 입력해주세요.')

        message.channel.send(embedMsg);
}

module.exports = dbManager;