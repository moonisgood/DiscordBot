const Discord = require("discord.js");
const game_config = require('../config/game_config.json');
const moment = require('moment-timezone');
const rank_name = ['배치', '아이언 4','아이언 3','아이언 2','아이언 1','브론즈 4','브론즈 3','브론즈 2','브론즈 1','실버 4','실버 3','실버 2','실버 1','골드 4','골드 3','골드 2','골드 1','플래티넘 4','플래티넘 3','플래티넘 2','플래티넘 1','다이아몬드 4','다이아몬드 3', '다이아몬드 2', '다이아몬드 1', '마스터', '그랜드 마스터', '챌린저'];

function UsersCreateData(message, conn) {
    let nowDate = moment().tz('Asia/Seoul').subtract(1, 'day').format("YYYY-MM-DD");

    conn.query(`INSERT INTO Users (user_id, guild_id, displayname, honor, money_blue, money_orange, level, experience, max_exp, daily, daily_check) VALUES ('${message.member.id}', '${message.guild.id}', '${message.member.displayName}', 2, 0, 0, 1, 0, 340, 0, '${nowDate}')`);
    console.log(`${message.member.id}-${message.guild.id}: 'Users' | new user's data created now.`)
};

function UsersDisplaynameChange(message, conn) {
    conn.query(`UPDATE Users SET displayname='${message.member.displayName}' WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`);
    console.log(`${message.member.id}-${message.guild.id}: 'Users' | user's Displayname changed now.`)
};

function MinigamePritoCreateData(message, conn) {
    conn.query(`INSERT INTO Minigame_Prito (user_id, guild_id, displayname, nowStage, bestStage) VALUES ('${message.member.id}', '${message.guild.id}', '${message.member.displayName}', 1, 1)`);
    console.log(`${message.member.id}-${message.guild.id}: 'Minigame_Prito' | new user's data created now.`)
};

function UsersUpdateMoney(message, money, conn) {
    conn.query(`UPDATE Users SET money_blue=money_blue+${money} WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`);
    console.log(`${message.member.id}-${message.guild.id}: 'Users' | user's data updated now.`)
};

function UsersRankCreateData(message, userid, displayname, conn) {
    conn.query(`INSERT INTO Users_Rank (user_id, guild_id, displayname, tier, wins, loses, totalMatches, points, mmr) VALUES ('${userid}', '${message.guild.id}', '${displayname}', 12, 0, 0, 0, 1200, 3)`);
    console.log(`${userid}-${message.guild.id}: 'Users_Rank' | new user's data created now.`)
};

function RankTeamCreateData(message, position, players=[], playersName=[], conn) {
    conn.query(`INSERT INTO Rank_Team 
    (guild_id, position, player1_id, player2_id, player3_id, player4_id, player5_id, player6_id, player7_id, player8_id, player9_id, player10_id, 
        player1_name, player2_name, player3_name, player4_name, player5_name, player6_name, player7_name, player8_name, player9_name, player10_name) 
        VALUES ('${message.guild.id}', ${position}, '${players[0]}', '${players[1]}', '${players[2]}', '${players[3]}', '${players[4]}', '${players[5]}','${players[6]}','${players[7]}','${players[8]}','${players[9]}', 
        '${playersName[0]}', '${playersName[1]}', '${playersName[2]}', '${playersName[3]}', '${playersName[4]}', '${playersName[5]}', '${playersName[6]}', '${playersName[7]}', '${playersName[8]}', '${playersName[9]}')`);
    console.log(`${message.guild.id}-Pos(${position}): 'Rank_Team' | new Rank_Team data created now.`)
};

function RankTeamUpdateData(message, position, players=[], playersName=[], conn) {
    conn.query(`UPDATE Rank_Team SET player1_id='${players[0]}', player2_id='${players[1]}', player3_id='${players[2]}', player4_id='${players[3]}', player5_id='${players[4]}', player6_id='${players[5]}', player7_id='${players[6]}', player8_id='${players[7]}', player9_id='${players[8]}', player10_id='${players[9]}', 
        player1_name='${playersName[0]}', player2_name='${playersName[1]}', player3_name='${playersName[2]}', player4_name='${playersName[3]}', player5_name='${playersName[4]}', player6_name='${playersName[5]}', player7_name='${playersName[6]}', player8_name='${playersName[7]}', player9_name='${playersName[8]}', player10_name='${playersName[9]}' WHERE guild_id='${message.guild.id}' AND position=${position}`);
    console.log(`${message.guild.id}-Pos(${position}): 'Rank_Team' | new Rank_Team data updated now.`)
};

function UserRankTeamUpdateData(message, players=[], winloseCheck, conn) 
{
    let fields = '';
    let fields2 = '';
    let maxMMR = 5;

    for(let idx=0; idx<players.length; idx++)
    {
        conn.query(`SELECT * FROM Users_Rank WHERE guild_id='${message.guild.id}' AND user_id='${players[idx]}'`, (err, result) => {
            if (err) throw err;

            if(winloseCheck) // 트루면 A팀 승
            {
                if(idx < 5) // A팀 승리
                {
                    let displayname = result[0].displayname;
                    let tier = result[0].tier;
                    let wins = result[0].wins;
                    let totalMatches = result[0].totalMatches;
                    let points = result[0].points;
                    let mmr = result[0].mmr;

                    let calPoints = 25+(3*mmr);
        
                    wins += 1;
                    totalMatches += 1;
                    points += 25+(3*mmr);
                    if(mmr<maxMMR)
                        mmr+=1;
                    tier = Math.floor(points/100);
                    if(tier>27)
                        tier = 27;
            
                    conn.query(`UPDATE Users_Rank SET tier=${tier}, wins=${wins}, totalMatches=${totalMatches}, points=${points}, mmr=${mmr} WHERE user_id='${players[idx]}' AND guild_id='${message.guild.id}'`);
                    console.log(`${players[idx]}-${message.guild.id}: 'Users_Rank' | user's data updated now.`)
        
                    let player_rank = '';
                    if(tier > result[0].tier)
                    {
                        player_rank = `[${rank_name[tier]}:up:]`;
                    }
                    else 
                    {
                        player_rank = `[${rank_name[tier]}]`;
                    }
                    let player_name = ` ${displayname} `;
                    let player_points = `[${points}:up: +${calPoints}]`;
                    fields += (player_rank + player_name + player_points + '\n');
                }
                else // B팀 패배
                {
                    let displayname = result[0].displayname;
                    let tier = result[0].tier;
                    let loses = result[0].loses;
                    let totalMatches = result[0].totalMatches;
                    let points = result[0].points;
                    let mmr = result[0].mmr;
                    
                    let calPoints = 25-(2*mmr);
            
                    loses += 1;
                    totalMatches += 1;
                    points -= 25-(2*mmr);
                    if(points < 100) 
                        points = 100;
                    if(mmr>0)
                        mmr-=1;
                    tier = Math.floor(points/100);
                    if(tier>27)
                        tier = 27;
                
                    conn.query(`UPDATE Users_Rank SET tier=${tier}, loses=${loses}, totalMatches=${totalMatches}, points=${points}, mmr=${mmr} WHERE user_id='${players[idx]}' AND guild_id='${message.guild.id}'`);
                    console.log(`${players[idx]}-${message.guild.id}: 'Users_Rank' | user's data updated now.`)
            
                    let player_rank = '';
                    if(tier < result[0].tier)
                    {
                        player_rank = `[${rank_name[tier]}:small_red_triangle_down:]`;
                    }
                    else 
                    {
                        player_rank = `[${rank_name[tier]}]`;
                    }
                    let player_name = ` ${displayname} `;
                    let player_points = `[${points}:small_red_triangle_down: -${calPoints}]`;
                    fields2 += (player_rank + player_name + player_points + '\n');

                    if(idx >= 9) // 메세지 출력
                    {
                        const embedMsg = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        //.setThumbnail(message.author.avatarURL())
                        .setTitle("######### 내전 :blue_square: A팀 승리 #########")
                        .addFields(
                            { name: ':blue_square: A팀\u200B', value: `${fields}`, inline: true },
                            { name: ':red_square: B팀\u200B', value: `${fields2}`, inline: true },
                        );
                          
                        message.channel.send(embedMsg);
                    }
                }
            }
            else if(!winloseCheck) // B팀 승
            {
                if(idx < 5) // A팀 패배
                {
                    let displayname = result[0].displayname;
                    let tier = result[0].tier;
                    let loses = result[0].loses;
                    let totalMatches = result[0].totalMatches;
                    let points = result[0].points;
                    let mmr = result[0].mmr;
            
                    let calPoints = 25-(2*mmr);
                    
                    loses += 1;
                    totalMatches += 1;
                    points -= 25-(2*mmr);
                    if(points < 100) 
                        points = 100;
                    if(mmr>0)
                        mmr-=1;
                    tier = Math.floor(points/100);
                    if(tier>27)
                        tier = 27;
                
                    conn.query(`UPDATE Users_Rank SET tier=${tier}, loses=${loses}, totalMatches=${totalMatches}, points=${points}, mmr=${mmr} WHERE user_id='${players[idx]}' AND guild_id='${message.guild.id}'`);
                    console.log(`${players[idx]}-${message.guild.id}: 'Users_Rank' | user's data updated now.`)
            
                    let player_rank = '';
                    if(tier < result[0].tier)
                    {
                        player_rank = `[${rank_name[tier]}:small_red_triangle_down:]`;
                    }
                    else 
                    {
                        player_rank = `[${rank_name[tier]}]`;
                    }
                    let player_name = ` ${displayname} `;
                    let player_points = `[${points}:small_red_triangle_down: -${calPoints}]`;
                    fields += (player_rank + player_name + player_points + '\n');
                }
                else // B팀 승리
                {
                    let displayname = result[0].displayname;
                    let tier = result[0].tier;
                    let wins = result[0].wins;
                    let totalMatches = result[0].totalMatches;
                    let points = result[0].points;
                    let mmr = result[0].mmr;

                    let calPoints = 25+(3*mmr);
        
                    wins += 1;
                    totalMatches += 1;
                    points += 25+(3*mmr);
                    if(mmr<maxMMR)
                        mmr+=1;
                    tier = Math.floor(points/100);
                    if(tier>27)
                        tier = 27;
            
                    conn.query(`UPDATE Users_Rank SET tier=${tier}, wins=${wins}, totalMatches=${totalMatches}, points=${points}, mmr=${mmr} WHERE user_id='${players[idx]}' AND guild_id='${message.guild.id}'`);
                    console.log(`${players[idx]}-${message.guild.id}: 'Users_Rank' | user's data updated now.`)
        
                    let player_rank = '';
                    if(tier > result[0].tier)
                    {
                        player_rank = `[${rank_name[tier]}:up:]`;
                    }
                    else 
                    {
                        player_rank = `[${rank_name[tier]}]`;
                    }
                    let player_name = ` ${displayname} `;
                    let player_points = `[${points}:up: +${calPoints}]`;
                    fields2 += (player_rank + player_name + player_points + '\n');

                    if(idx >= 9) // 메세지 출력
                    {
                        const embedMsg = new Discord.MessageEmbed()
                        .setColor('#ff0000')
                        //.setThumbnail(message.author.avatarURL())
                        .setTitle("######### 내전 :red_square: B팀 승리#########")
                        .addFields(
                            { name: ':blue_square: A팀\u200B', value: `${fields}`, inline: true },
                            { name: ':red_square: B팀\u200B', value: `${fields2}`, inline: true },
                        );
                          
                        message.channel.send(embedMsg);
                    }
                }
            }
        });
    }
}


module.exports = {
    UsersCreateData: UsersCreateData,
    UsersDisplaynameChange: UsersDisplaynameChange,
    MinigamePritoCreateData: MinigamePritoCreateData,
    UsersUpdateMoney: UsersUpdateMoney,
    UsersRankCreateData: UsersRankCreateData,
    RankTeamCreateData: RankTeamCreateData,
    RankTeamUpdateData: RankTeamUpdateData,
    UserRankTeamUpdateData: UserRankTeamUpdateData,
};