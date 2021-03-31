const Discord = require("discord.js");
const game_config = require('../config/game_config.json');
const moment = require('moment-timezone');

function UsersCreateData(message, conn) {
    let date = new Date();
    let nowDate = moment().tz('Asia/Seoul').subtract(1, 'day').format("YYYY-MM-DD");

    conn.query(`INSERT INTO Users (user_id, guild_id, displayname, honor, money_blue, money_orange, level, experience, max_exp, daily, daily_check) VALUES ('${message.member.id}', '${message.guild.id}', '${message.member.displayName}', 2, 0, 0, 1, 0, 340, 0, '${nowDate}')`);
    console.log(`${message.member.id}-${message.guild.id}: 'Users' | new user's data created now.`)
};

function UsersDisplaynameChange(message, conn) {
    conn.query(`UPDATE Users SET displayname='${message.member.displayName}' WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`);
    console.log(`${message.member.id}-${message.guild.id}: 'Users' | user's Displayname changed now.`)
}

module.exports = {
    UsersCreateData: UsersCreateData,
    UsersDisplaynameChange: UsersDisplaynameChange,
};

//console.log(parseInt(game_config.daily_experience));