const Discord = require("discord.js");
const connection = require("../db/dbSet.js");
const ms = require("parse-ms");
const dbManager = require("../function/dbManager.js");

module.exports = {
    name: '출석',
    description: '출석체크를 합니다.',
    execute(message, args) {
        
        let timeout = 86400000;
        let reward_moneyblue = 50;
        let reward_exp = 400;

        connection.query(`SELECT * FROM Users WHERE user_id=${message.member.id} AND guild_id=${message.guild.id}`, (err, result) => {
            if (err) throw err;

            if(result.length < 1) {
                dbManager.UsersCreatedCheck(message, args);
            }

            if(result.length === 1)
            {
                if(timeout - (Date.now() - result[0].daily_check) > 0) {
                    console.log(Date.now());
                    let time = ms(timeout - (Date.now() - result[0].daily_check));
                    message.channel.send(`${time.hours}시간 ${time.minutes}분 ${time.seconds}초 남았ㅇ용`);
                } else {
                            
                    connection.query(`UPDATE Users SET money_blue = money_blue+${reward_moneyblue}, daily = daily+1, daily_check = ${Date.now()} WHERE ${message.member.id} AND ${message.guild.id}`, err => {
                        if (err) throw err;
                        //message.channel.send("출석 완료!");
                        const embedMsg = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        //.setTitle('샘플 메시지에용')
                        //.setURL('https://velog.io')
                        //.setAuthor('Binary Yoon')
                        //.setThumbnail(challengerSrc)
                        .addField('출석 완료!', `현재 출석하신 횟수는 '${result[0].daily+1}'회 입니다.`)
                        .addField('보상', `${reward_exp}경험치, ${reward_moneyblue}파랑정수를 획득하셨습니다.`)
                        //.addField('요 둘은', '필드 내용', true)
                        //.addField('같은 라인에', '필드 내용', true)
                         //.setImage(challengerSrc);
                          
                        message.channel.send(embedMsg);
                    });    
                }
            }
        });
    },
};