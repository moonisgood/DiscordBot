const Discord = require("discord.js");
const getConnection = require('../db/db.js');
const game_config = require('../config/game_config.json');
const { UsersCreateData } = require("../function/dbManager.js");
const moment = require('moment-timezone');

module.exports = {
    name: '출석',
    description: '출석체크를 합니다.',
    cooldown: 3,
    execute(message, args) {
        
        getConnection((conn) => {
            conn.query(`SELECT * FROM Users WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`,(err, result) => {
                if (err) throw err;

                    if(result.length < 1)
                    {
                        UsersCreateData(message, conn); // 새로운 데이터 생성
                        message.channel.send("```계정이 생성되었습니다.```");
                    }

                    else if(result.length === 1)
                    {
                        //require('moment-timezone');
                        //moment.tz.setDefault("Asia/Seoul");

                        let date = new Date();
                        let nowDate = moment(date).tz('Asia/Seoul').format("YYYY-MM-DD");
                        let lastDailyDate = moment(result[0].daily_check).format("YYYY-MM-DD");
                        
                        if(moment(nowDate).isBefore(lastDailyDate) || moment(nowDate).isSame(lastDailyDate)) {
                            message.channel.send("```" + "이미 출석하셨습니다. 마지막 출석 : " + lastDailyDate + "```");
                        }
                        else if(moment(lastDailyDate).isBefore(nowDate)) {
                            const raiseExp = 40;
        
                            let level = result[0].level;
                            let exp = result[0].experience;
                            let daily = result[0].daily;
        
                            let maxExp = 0;
                            let fixLevel = level;
                            let fixExp = exp;
                            let reward_exp = parseInt(game_config.daily_reward_exp);
                            let reward_moneyblue = parseInt(game_config.daily_reward_moneyblue);
                            let nextExp = 0;

                            switch (parseInt(level/10)) {
                                case 0:
                                    maxExp = 300 + (raiseExp * level);
                                    if(level == 9) { nextExp = (660 + (raiseExp * level)); } 
                                    else if(level < 9) { nextExp = (300 + (raiseExp * (level+1))); }
                                    break;
                                case 1:
                                    maxExp = 660 + (raiseExp * level);
                                    if (level == 19) { nextExp = (1420 + (raiseExp * level)); }
                                    else if(level < 19) { nextExp = (660 + (raiseExp * (level+1))); }
                                    break;
                                case 2:
                                    maxExp = 1420 + (raiseExp * level);
                                    if (level == 29) nextExp = (2580);
                                    else if(level < 29) { nextExp = (1420 + (raiseExp * (level+1))); }
                                    break;
                                default:
                                    maxExp = 2580;
                                    nextExp = 2580;
                                    break;
                            }
        
                            fixExp += 400;
        
                            const embedMsg = new Discord
                                .MessageEmbed()
                                .setColor('#0099ff')
                                .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                                .setThumbnail(message.author.avatarURL());
        
                            if (fixExp >= maxExp) {
                                fixLevel += 1;
                                fixExp = Math.abs((exp+reward_exp) - maxExp);
                                reward_moneyblue *= 2;
                                
                                embedMsg
                                .setTitle("출석 완료.")
                                .addFields(
                                    { name: '레벨업! 추가 보상이 지급되었습니다.', value: `경험치 ${reward_exp}, 파랑정수 ${reward_moneyblue} 획득` }, 
                                    { name: '레벨', value: `${level} -> ${fixLevel} (+1:up:)`, inline: true }, 
                                    { name: '경험치', value: `${exp} / ${maxExp} (+${reward_exp}:up:) -> ${fixExp} / ${nextExp}`, inline: true },
                                    { name: '출석한 횟수', value: `${daily}회 -> ${daily+1}회`, inline: true },
                                );
                            } 
                            else if (fixExp < maxExp) {
                                embedMsg
                                .setTitle("출석 완료.")
                                .addFields(
                                    { name: '보상이 지급되었습니다.', value: `경험치 ${reward_exp}, 파랑정수 ${reward_moneyblue} 획득` }, 
                                    { name: '레벨', value: `${level}`, inline: true },
                                    { name: '경험치', value: `${exp} / ${maxExp} (+${reward_exp}:up:) -> ${fixExp} / ${maxExp}`, inline: true }, 
                                    { name: '출석한 횟수', value: `${daily}회 -> ${daily+1}회`, inline: true },
                                );
                            }
                            conn.query(`UPDATE Users SET level=${fixLevel}, experience=${fixExp}, max_exp=${nextExp}, money_blue=money_blue+${reward_moneyblue}, daily=daily+1, daily_check='${nowDate}' WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`);
                            console.log(`${message.member.id}-${message.guild.id}: 'Users' | user's Data Updated now.`)

                            message.channel.send(embedMsg);
                         }
                    }
                }
            );
            conn.release();
        });
    }
};
    
    // conn.query(`UPDATE Users SET displayname='${message.member.displayName}' WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`);

    //     connection.query(`SELECT * FROM Users WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`, (err, result) => {
    //         if (err) throw err;

    //         if(result.length < 1) {
    //             connection.query(`INSERT INTO Users (user_id, guild_id, displayname, honor, money_blue, money_orange, level, experience, daily, daily_check) VALUES ('${message.member.id}', '${message.guild.id}', '${message.member.displayName}', 2, 0, 0, 1, 0, 0, '0')`);
    
    //             const embedMsg = new Discord.MessageEmbed()
    //             .setColor('#ff0000')
    //             .addField('시스템', '데이터가 없어 추가합니다. 명령어를 다시 입력해주세요.')

    //             message.channel.send(embedMsg);
    //         }

    //         if(result.length === 1)
    //         {
    //             if(timeout - (Date.now() - result[0].daily_check) > 0) {
    //                 console.log(Date.now());
    //                 let time = ms(timeout - (Date.now() - result[0].daily_check));
    //                 message.channel.send(`${time.hours}시간 ${time.minutes}분 ${time.seconds}초 남았ㅇ용`);
    //             } else {
                            
    //                 connection.query(`UPDATE Users SET money_blue=money_blue+${reward_moneyblue}, daily=daily+1, daily_check='${Date.now()}' WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`, err => {
    //                     if (err) throw err;
    //                     console.log(`${message.member.id} + ${message.guild.id}`);
    //                     //message.channel.send("출석 완료!");
    //                     const embedMsg = new Discord.MessageEmbed()
    //                     .setColor('#0099ff')
    //                     //.setTitle('샘플 메시지에용')
    //                     //.setURL('https://velog.io')
    //                     //.setAuthor('Binary Yoon')
    //                     //.setThumbnail(challengerSrc)
    //                     .addField('출석 완료!', `현재 출석하신 횟수는 '${result[0].daily+1}'회 입니다.`)
    //                     .addField('보상', `${reward_exp}경험치, ${reward_moneyblue}파랑정수를 획득하셨습니다.`)
    //                     //.addField('요 둘은', '필드 내용', true)
    //                     //.addField('같은 라인에', '필드 내용', true)
    //                      //.setImage(challengerSrc);
                          
    //                     message.channel.send(embedMsg);
    //                 });    
    //             }
    //         }
    //     });
    // },