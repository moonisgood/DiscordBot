const Discord = require("discord.js");
const getConnection = require('../db/db.js');
const { UsersCreateData,UsersDisplaynameChange } = require("../function/dbManager.js");

module.exports = {
    name: '내정보',
    description: '내정보를 확인합니다.',
    cooldown: 3,
    guildOnly: true,
    execute(message, args) {
        getConnection((conn) => {
            conn.query(`SELECT * FROM Users WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`, (err, result) => {
                    if (err) throw err;

                    if(result.length < 1)
                    {
                        UsersCreateData(message, conn); // 새로운 데이터 생성
                        message.channel.send("```계정이 생성되었습니다.```");
                    }
                    else if(result.length === 1)
                    {
                        if(message.member.displayName != result[0].displayname)
                        {
                            UsersDisplaynameChange(message, conn);
                        }
                        
                        const embedMsg = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                        .setThumbnail(message.author.avatarURL())
                        .addFields(
                            { name: '레벨', value: `${result[0].level}`, inline: true },
                            { name: '경험치', value: `${result[0].experience} / ${result[0].max_exp}`, inline: true },
                            { name: '출석한 횟수', value: `${result[0].daily}회`, inline: true },
                        )
                        .addFields(
                            { name: '파랑정수', value: `💧 ${result[0].money_blue}`, inline: true },
                            { name: '주황정수', value: `🔥 ${result[0].money_orange}`, inline: true },
                        );
                          
                        message.channel.send(embedMsg);
                    }
                }
            );
            conn.release();
        });
    }
};