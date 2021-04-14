const Discord = require("discord.js");
const getConnection = require('../db/db.js');
const { UsersCreateData } = require("../function/dbManager.js");

module.exports = {
    name: '도박',
    description: '정수 50개로 도박을 합니다.',
    cooldown: 3,
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
                    const embedMsg = new Discord.MessageEmbed();

                    if(result[0].money_blue >= 50)
                    {
                            
                        let random = parseInt((Math.random() * (100 - 1 + 1) + 1));
                        let money = 0;

                        if(1 <= random && random <= 45) {
                            money += 50;
                            embedMsg
                            .setColor('#0099ff')
                            .addField(`'${message.member.displayName}' 도박 성공!`, `파랑정수💧50을 얻었습니다.\n보유한 파랑정수: 💧${result[0].money_blue+money}( +50 )`)
                        }
                        else if(46 <= random && random <= 100) {
                            money -= 50;
                            embedMsg
                            .setColor('#ff0000')
                            .addField(`'${message.member.displayName}' 도박 실패!`, `파랑정수💧50을 잃었습니다.\n보유한 파랑정수 : 💧${result[0].money_blue+money}( -50 )`)
                        }
                        message.channel.send(embedMsg);
                        conn.query(`UPDATE Users SET money_blue=money_blue+${money} WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`);
                        console.log(`${message.member.id}-${message.guild.id}: 'Users' | user's Data Updated now.`)
                    }
                    else
                    {
                        message.channel.send("```도박을 하려면 파랑정수50개가 필요합니다.```");
                
                        message.channel.send(embedMsg);
                    }
                }
            });
            conn.release();
        });
    }
};