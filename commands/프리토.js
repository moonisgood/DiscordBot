const Discord = require("discord.js");
const getConnection = require('../db/db.js');
const { Minigame_PritoCreateData } = require("../function/dbManager.js");

module.exports = {
    name: '프리토',
    description: '도전!',
    cooldown: 10,
    execute(message, args) {
        
        getConnection((conn) => {

            conn.query(`SELECT * FROM Minigame_Prito WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`, (err, result) => {
                if (err) throw err;

                if(result.length < 1) {
                    Minigame_PritoCreateData(message, conn); // 새로운 데이터 생성
                    message.channel.send("```yaml\n[미니게임]프리토 참가 완료.\n명령어: ~프리토 왼 / ~ 프리토 오\n```");
                }
                else if(result.length === 1) {
                    const embed = new Discord.MessageEmbed();
                    let random = parseInt((Math.random() * (2 - 1 + 1) + 1));
                    let nowStage = result[0].nowStage;
                    let bestStage = result[0].bestStage;

                    if (args[0] === '왼') {
                        if(random === 1) {
                            nowStage+=1;
                            console.log(nowStage);
                            if(nowStage > bestStage) {
                                bestStage = nowStage;
                            }

                            embed
                            .setColor('#0099ff')
                            .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                            .setTitle(`왼쪽으로 오르기 성공!! \n현재 층수: ${nowStage-1}층 --> ${nowStage}층\n최고 기록: ${bestStage}층`);   
                        }
                        else {
                            nowStage = 1;
                            embed
                            .setColor('#ff0000')
                            .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                            .setTitle(`왼쪽으로 오르기 실패.. \n현재 층수: ${nowStage}층 --> 1층\n최고 기록: ${bestStage}층`);
                        }
                    }
                    else if (args[0] === '오') {
                        if(random === 2) {
                            nowStage+=1;
                            if(nowStage > bestStage) {
                                bestStage = nowStage;
                            }

                            embed
                            .setColor('#0099ff')
                            .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                            .setTitle(`오른쪽으로 오르기 성공!! \n현재 층수: ${nowStage-1}층 --> ${nowStage}층\n최고 기록: ${bestStage}층`);      
                        }
                        else {
                            nowStage = 1;
                            embed
                            .setColor('#ff0000')
                            .setAuthor(`${message.member.displayName}`, message.author.avatarURL())
                            .setTitle(`오른쪽으로 오르기 실패.. \n현재 층수: ${nowStage}층 --> 1층\n최고 기록: ${bestStage}층`);
                        }
                    }   
            
                conn.query(`UPDATE Minigame_Prito SET nowStage=${nowStage}, bestStage=${bestStage} WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`);
                console.log(`${message.member.id}-${message.guild.id}: 'Minigame_Prito' | user's Data Updated now.`)
                message.channel.send(embed);
                }
            });
            conn.release();
        });
    }
};