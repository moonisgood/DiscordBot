const Discord = require("discord.js");
const getConnection = require('../db/db.js');
const { UsersCreateData, Minigame_PritoCreateData, Users_UpdateMoney } = require("../function/dbManager.js");

module.exports = {
    name: '프리토',
    description: '미니게임 - 왼쪽 오른쪽을 골라 1층씩 올라갑니다. 최고 기록 갱신시 정수가 지급됩니다.',
    usage: '[왼/오]',
    guildOnly: true,
    cooldown: 3,
    execute(message, args) {
        
        getConnection((conn) => {

            conn.query(`SELECT * FROM Users WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`, (userErr, userResult) => {
                if (userErr) throw userErr;

                if(userResult.length < 1) {
                    UsersCreateData(message, conn); // 새로운 데이터 생성
                    message.channel.send("```계정이 생성되었습니다.```");
                }
                else if(userResult.length === 1) {
                    conn.query(`SELECT * FROM Minigame_Prito WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`, (err, result) => {
                        if (err) throw err;
                    
                        if(result.length < 1) {
                            Minigame_PritoCreateData(message, conn); // 새로운 데이터 생성
                            message.channel.send("```yaml\n[미니게임]프리토 참가 완료.\n명령어: ~프리토 왼 / ~프리토 오\n```");
                        }
                        else if(result.length === 1) {
                            embed = new Discord.MessageEmbed();
                            let random = parseInt((Math.random() * (2 - 1 + 1) + 1));
                            let nowStage = result[0].nowStage;
                            let bestStage = result[0].bestStage;
                            let bonusMoney = 0;
                            
                            if (args[0] === '왼') {
                                if(random === 1) {
                                    nowStage+=1;
                                    console.log(nowStage);
                                    if(nowStage > bestStage) {
                                        bonusMoney = nowStage*50;
                                        bestStage = nowStage;
                                        Users_UpdateMoney(message, bonusMoney, conn);
                                        embed
                                        .addField('최고 기록 갱신', `파랑정수💧${nowStage*50}개 지급되었습니다.`);  
                                    }

                                    embed
                                    .setColor('#0099ff')
                                    .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                                    .setTitle(`왼쪽으로 오르기 성공!! \n현재 층수: ${nowStage-1}층 --> ${nowStage}층\n최고 기록: ${bestStage}층`);   
                                }
                                else {
                                    embed
                                    .setColor('#ff0000')
                                    .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                                    .setTitle(`왼쪽으로 오르기 실패.. \n현재 층수: ${nowStage}층 --> 1층\n최고 기록: ${bestStage}층`);
                                    nowStage = 1;
                                }
                            }
                            else if (args[0] === '오') {
                                if(random === 2) {
                                    nowStage+=1;
                                    if(nowStage > bestStage) {
                                        bonusMoney = nowStage*50;
                                        bestStage = nowStage;
                                        Users_UpdateMoney(message, bonusMoney, conn);
                                        embed
                                        .addField('최고 기록 갱신', `파랑정수💧${nowStage*50}개 지급되었습니다.`);  
                                    }

                                    embed
                                    .setColor('#0099ff')
                                    .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                                    .setTitle(`오른쪽으로 오르기 성공!! \n현재 층수: ${nowStage-1}층 --> ${nowStage}층\n최고 기록: ${bestStage}층`);      
                                }
                                else {
                                    embed
                                    .setColor('#ff0000')
                                    .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                                    .setTitle(`오른쪽으로 오르기 실패.. \n현재 층수: ${nowStage}층 --> 1층\n최고 기록: ${bestStage}층`);
                                    nowStage = 1;
                                }
                            }
                            else {
                                return message.channel.send("```yaml\n[미니게임]프리토 명령어\n명령어: ~프리토 왼 / ~프리토 오\n```");
                            }   
            
                            conn.query(`UPDATE Minigame_Prito SET nowStage=${nowStage}, bestStage=${bestStage} WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`);
                            console.log(`${message.member.id}-${message.guild.id}: 'Minigame_Prito' | user's Data Updated now.`)
                            message.channel.send(embed);
                        }
                    });
                }
            });
            conn.release();
        });
    }
};