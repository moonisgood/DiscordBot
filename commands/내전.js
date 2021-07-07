const Discord = require("discord.js");
const fs = require('fs');
const getConnection = require('../db/db.js');
const { UsersRankCreateData,RankTeamCreateData,RankTeamUpdateData,UserRankTeamUpdateData } = require("../function/dbManager.js");
const { prefix } = require('../config.js');

const rank_name = ['배치', '아이언 4','아이언 3','아이언 2','아이언 1','브론즈 4','브론즈 3','브론즈 2','브론즈 1','실버 4','실버 3','실버 2','실버 1','골드 4','골드 3','골드 2','골드 1','플래티넘 4','플래티넘 3','플래티넘 2','플래티넘 1','다이아몬드 4','다이아몬드 3', '다이아몬드 2', '다이아몬드 1', '마스터', '그랜드 마스터', '챌린저'];
const rank_image = ['default', 'iron_4','iron_3','iron_2','iron_1','bronze_4','bronze_3','bronze_2','bronze_1','silver_4','silver_3','silver_2','silver_1','gold_4','gold_3','gold_2','gold_1','platinum_4','platinum_3','platinum_2','platinum_1','diamond_4','diamond_3', 'diamond_2', 'diamond_1', 'master_1', 'grandmaster_1', 'challenger_1'];

module.exports = {
    name: '내전',
    description: '내전 시스템',
    usage: '[내정보/검색/계정추가/팀/팀생성/팀지우기/승/패]',
    cooldown: 0.5,
    guildOnly: true,
    execute(message, args) {
        getConnection((conn) => {
            const saveLimit = 3; // 팀 저장할 수 있는 최대 공간

            if(!args[0]) // /내전 - 기본 명령어를 보여줌
            {
                // message.delete();

                const embed = new Discord.MessageEmbed()
                .setColor('#E91E63')
                .setTitle(`명령어: ${prefix}내전 내정보/검색/계정추가/팀/팀생성/팀지우기/승/패`);
                message.channel.send(embed);      
            }
            else if(args[0] === '내정보') // /내전 내정보 - 내정보를 보여줌
            {
                // message.delete();

                conn.query(`SELECT * FROM Users_Rank WHERE user_id='${message.member.id}' AND guild_id='${message.guild.id}'`, (err, result) => {
                    if (err) throw err;

                    if(result.length < 1)
                    {
                        UsersRankCreateData(message, message.member.id, message.member.displayName, conn); // 새로운 데이터 생성
                        message.channel.send("```계정이 생성되었습니다.```");
                    }
                    else if(result.length === 1)
                    {
                        let winrate = result[0].wins/(result[0].wins+result[0].loses)*100;
                        if(!winrate) // 승률 계산이 안되면 0으로 초기화
                            winrate = 0;

                        const embed = new Discord.MessageEmbed()
                        .setColor('#E67E22')
                        .setAuthor(`${message.member.displayName}님의 내전정보`, message.author.avatarURL())
                        .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[result[0].tier]}.png?`)
                        .addFields(
                            { name: '티어', value: `${rank_name[result[0].tier]}`, inline: true },
                            { name: '점수', value: `${result[0].points}`, inline: true },
                        )
                        .addFields(
                            { name: '승/패/승률', value: `${result[0].wins} / ${result[0].loses} / ${winrate.toFixed(2)}%`, inline: false },
                        )
                        message.channel.send(embed);
                    }
                });
            }
            else if(args[0] === '계정생성') // /내전 계정생성 @닉네임 표시닉네임
            {
                fs.readFile('./config/admin.json', 'utf8', (error, jsonFile) => {
                    if (error) return console.log(error);

                    const jsonData = JSON.parse(jsonFile);
                    const admin = jsonData.admin;

                    let adminCheck = false;
                    
                    for(idx in admin) // 관리자 체크 반복문
                    {
                        if(admin[idx].id === message.author.id)
                        {
                            adminCheck = true;
                            break;
                        }
                    }
                    
                    if(adminCheck) // 관리자 인증 성공
                    {
                        if(args[1] && args[2]) // @닉네임 표시닉네임이 존재해야함
                        {
                            let mentionId = getUserFromMention(args[1]);
                            if(mentionId) // 첫번째 인자가 @닉네임 충족하면
                            {
                                conn.query(`SELECT * FROM Users_Rank WHERE user_id='${mentionId}' AND guild_id='${message.guild.id}'`, (err, result) => {
                                    if (err) throw err;

                                    if(result.length < 1)
                                    {
                                        UsersRankCreateData(message, mentionId, args[2], conn); // 새로운 데이터 생성
                                        message.channel.send("```계정이 생성되었습니다.```");
                                    }
                                    else if(result.length === 1)
                                    {
                                        const embedMsg = new Discord.MessageEmbed()
                                        .setColor('#ff0000')
                                        .setTitle('해당 아이디는 이미 존재합니다.');
                                        message.channel.send(embedMsg);
                                    }
                                });
                            }
                            else // 첫번째 인자가 @닉네임 충족하지 않으면
                            {
                                const embedMsg = new Discord.MessageEmbed()
                                .setColor('#ff0000')
                                .setTitle('멘션으로 입력해야 합니다.');
                                return message.channel.send(embedMsg);
                            }
                        }
                        else // @닉네임 표시닉네임이 존재하지 않으면 return
                        {
                            const embedMsg = new Discord.MessageEmbed()
                            .setColor('#E67E22')
                            .setTitle(`명령어: ${prefix}내전 계정생성 @닉네임(멘션) 표기닉네임`);
                            return message.channel.send(embedMsg);
                        }
                    }
                    else if(!adminCheck) // 관리자 인증 실패
                    {
                        const embedMsg = new Discord.MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('당신은 관리자 명령어를 사용할 권한이 없습니다.');
                        message.channel.send(embedMsg);
                    }
                });
            }
            else if(args[0] === '팀생성') // /내전
            {
                fs.readFile('./config/admin.json', 'utf8', (error, jsonFile) => {
                    if (error) return console.log(error);

                    const jsonData = JSON.parse(jsonFile);
                    const admin = jsonData.admin;
                    
                    let adminCheck = false; // 관리자 체크 변수
                    
                    for(idx in admin) // 관리자 체크 반복문
                    {
                        if(admin[idx].id === message.author.id)
                        {
                            adminCheck = true;
                            break;
                        }
                    }
                    
                    if(adminCheck) // 관리자 인증 성공
                    {                
                        if(args[1] < saveLimit) // 저장할 위치 선택 ex)0,1,2
                        {
                            if(args.length >= 11) // 모든 인자가 들어있는지 체크
                            {
                                conn.query(`SELECT * FROM Users_Rank WHERE guild_id='${message.guild.id}'`, (err, user_rank_result) => {
                                    if (err) throw err;

                                    let players = []; // 멘션한 플레이어 아이디를 저장
                                    let playersName = []; // 멘션한 플레이어의 닉네임을 저장
                                    let playersTier = []; // 멘션한 플레이어의 티어를 저장
                                    let playersPoint = []; // 멘션한 플레이어의 포인트를 저장
                                    let players_mention = []; // 멘션한 플레이어의 멘션을 저장

                                    let players_db = []; // db에서 아이디를 불러와 저장
                                    let playersName_db = []; // db에서 닉네임을 불러와 저장
                                    let playersTier_db = []; // db에서 티어를 불러와 저장
                                    let playersPoint_db = []; // db에서 점수를 불러와 저장

                                    for(idx in user_rank_result) // db에 있는 모든 데이터 불러와서 저장
                                    {
                                        players_db.push(user_rank_result[idx].user_id);
                                        playersName_db.push(user_rank_result[idx].displayname);
                                        playersTier_db.push(user_rank_result[idx].tier);
                                        playersPoint_db.push(user_rank_result[idx].points);
                                    }

                                    for(let i=2;i<12;i++) // players, players_mention 저장하는 반복문
                                    {
                                        players.push(getUserFromMention(args[i]));
                                        players_mention.push(args[i]);
                                        // console.log(i-1+'번째 플레이어 저장');
                                    }
                                    // console.log(players);
                                    // console.log(players_db);

                                    // 중복 체크
                                    let overlap_players = []; // 인자에 있는 중복된 멘션 저장

                                    for(let i=0;i<players.length;i++) // 멘션한 플레이어 중 서로 중복되는게 있는지 체크
                                    {
                                        if(players.indexOf(players[i]) !== players.lastIndexOf(players[i])) 
                                            overlap_players.push(players_mention[i]);         
                                    }

                                    // console.log(overlap_players);
                                    if(overlap_players.length >= 1)
                                        return message.channel.send("중복된 계정으로 생성 실패\n" + overlap_players);
                                    // 중복 체크

                                    // 해당 멘션의 정보가 존재하는지 체크
                                    let idCheck = []; // 중복인 아이디 저장
                                
                                    idCheck = players.filter(x => !players_db.includes(x));
                                
                                    for(let i=0;i<idCheck.length ;i++)
                                    {
                                        for(let j=0; j<10; j++)
                                        {
                                            if(idCheck[i] === players[j])
                                            {
                                                idCheck[i] = players_mention[j]
                                                break;
                                            }
                                        }
                                    }

                                    if (idCheck.length >= 1) 
                                        return message.channel.send("해당 아이디의 정보가 존재하지 않습니다.\n" + idCheck);
                                    // 해당 멘션의 정보가 존재하는지 체크
                                
                                    // db변수에 있는 플레이어의 정보를 로컬로 이동
                                    for (idx in players) {
                                        for (idx2 in players_db) {
                                            if (players[idx] === players_db[idx2]) {
                                                playersName.push(playersName_db[idx2]);
                                                playersTier.push(playersTier_db[idx2]);
                                                playersPoint.push(playersPoint_db[idx2]);
                                                break;
                                            }
                                        }
                                    }
                                    // db변수에 있는 플레이어의 정보를 로컬에 저장

                                    conn.query(`SELECT * FROM Rank_Team WHERE guild_id='${message.guild.id}' AND position='${args[1]}'`, (err, result) => {
                                        if (err) throw err;
                                            
                                        let ateam = '';
                                        let apower = 0;
                                        let bteam = '';
                                        let bpower = 0;

                                        for(let i=0;i<5;i++)
                                        {
                                            ateam += "[" + rank_name[playersTier[i]] + "] " + playersName[i] + " [" + playersPoint[i] + ']\n';
                                            apower += playersPoint[i];
                                        }
                                        for(let i=5;i<10;i++)
                                        {
                                            bteam += "[" + rank_name[playersTier[i]] + "] " + playersName[i] + " [" + playersPoint[i] + ']\n';
                                            bpower += playersPoint[i];
                                        }

                                        const embedMsg = new Discord.MessageEmbed()
                                        .setColor('#F1C40F')
                                        .setTitle("######### 내전 #########")
                                        .addFields(
                                            { name: ':blue_square: A팀\u200B', value: `${ateam}:fire:  ${apower}`, inline: true },
                                            { name: ':red_square: B팀\u200B', value: `${bteam}:fire:  ${bpower}`, inline: true }
                                        );

                                        if(result.length < 1)
                                        {
                                            RankTeamCreateData(message, args[1], players, playersName, conn); // 새로운 데이터 생성                                                  
                                            message.channel.send(embedMsg);
                                        }
                                        else if(result.length === 1)
                                        {
                                            RankTeamUpdateData(message, args[1], players, playersName, conn); // 새로운 데이터 생성
                                            message.channel.send(embedMsg);
                                        }
                                    }); 
                                });
                            }    
                            else // 10명이 없으면
                            {
                                const embedMsg = new Discord.MessageEmbed()
                                .setColor('#ff0000')
                                .setTitle(`플레이어 10명을 입력해야 합니다.`);
                                message.channel.send(embedMsg);
                            }
                        }
                        else // 저장 위치 입력 실패
                        {
                            const embedMsg = new Discord.MessageEmbed()
                            .setColor('#ff0000')
                            .setTitle(`${prefix}내전 팀생성 0~2(저장할위치) @닉네임1(멘션) 2 3 4 5 6 7 8 9 10`);
                            message.channel.send(embedMsg);
                        }
                    }
                    else if(!adminCheck) // 관리자 체크
                    {
                        const embedMsg = new Discord.MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('당신은 관리자 명령어를 사용할 권한이 없습니다.');
                        message.channel.send(embedMsg);
                    }
                });
            }
            else if(args[0] === '승')
            {
                let winloseCheck = true; // A팀 승
                if(args[1] < 3)
                {
                    conn.query(`SELECT * FROM Rank_Team WHERE guild_id='${message.guild.id}' AND position='${args[1]}'`, (err, result) => {
                        if (err) throw err;

                        if(result.length < 1)
                        {
                            const embedMsg = new Discord.MessageEmbed()
                            .setColor('#ff0000')
                            .setTitle('내전 팀이 제대로 생성되지 않았습니다.');
                            message.channel.send(embedMsg);
                        }
                        else if(result.length >= 1)
                        {
                            let players = [];
                            for(let i=0; i<10; i++)
                            {
                                let str = `result[0].player${i+1}_id`;
                                players[i] = eval(str);
                            }
                            UserRankTeamUpdateData(message,players,winloseCheck,conn);
                        }
                    });
                }
                else
                {
                    const embedMsg = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle(`${prefix}내전 승 0~2(저장위치)\nA팀 기준`);
                    message.channel.send(embedMsg);
                }
            }
            else if(args[0] === '패')
            {
                let winloseCheck = false; // A팀 패배
                if(args[1] < 3)
                {
                    conn.query(`SELECT * FROM Rank_Team WHERE guild_id='${message.guild.id}' AND position='${args[1]}'`, (err, result) => {
                        if (err) throw err;

                        if(result.length < 1)
                        {
                            const embedMsg = new Discord.MessageEmbed()
                            .setColor('#ff0000')
                            .setTitle('내전 팀이 제대로 생성되지 않았습니다.');
                            message.channel.send(embedMsg);
                        }
                        else if(result.length >= 1)
                        {
                            let players = [];
                            for(let i=0; i<10; i++)
                            {
                                let str = `result[0].player${i+1}_id`;
                                players[i] = eval(str);
                            }
                            UserRankTeamUpdateData(message,players,winloseCheck,conn);
                        }
                    });
                }
                else
                {
                    const embedMsg = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle(`${prefix}내전 승 0~2(저장위치)\nA팀 기준`);
                    message.channel.send(embedMsg);
                }
            }
            else if(args[0] === '팀지우기')
            {
                fs.readFile('./config/admin.json', 'utf8', (error, jsonFile) => {
                    if (error) return console.log(error);

                    const jsonData = JSON.parse(jsonFile);
                    const admin = jsonData.admin;
                    
                    let adminCheck = false;
                    
                    for(idx in admin)
                    {
                        if(admin[idx].id === message.author.id)
                        {
                            adminCheck = true;
                            break;
                        }
                    }
                    
                    if(adminCheck)
                    {                
                        if(args[1] < 3) // 최소 1개에서 최대 3개 0,1,2
                        {
                            conn.query(`SELECT * FROM Rank_Team WHERE guild_id='${message.guild.id}' AND position='${args[1]}'`, (err, result) => {
                                if (err) throw err;
                                
                                if(result.length < 1) {
                                    const embedMsg = new Discord.MessageEmbed()
                                    .setColor('#ff0000')
                                    .setTitle(`지울 내전 팀이 없습니다.`);
                                    message.channel.send(embedMsg);

                                }
                                if(result.length === 1) {
                                    conn.query(`DELETE FROM Rank_Team WHERE guild_id='${message.guild.id}' AND position='${args[1]}'`);
                                    const embedMsg = new Discord.MessageEmbed()
                                    .setColor('#ff0000')
                                    .setTitle(`${args[1]}번째 내전이 삭제되었습니다.`);
                                    message.channel.send(embedMsg);
                                }
                            });
                        }
                        else
                        {
                            const embedMsg = new Discord.MessageEmbed()
                            .setColor('#ff0000')
                            .setTitle(`${prefix}내전 팀지우기 0~2(저장위치)`);
                            message.channel.send(embedMsg);
                        }
                    }
                });
            }
            else if(args[0] === '검색')
            {
                let mentionId = getUserFromMention(args[1]);
                const target = message.mentions.users.first();

                if(mentionId)
                {
                    conn.query(`SELECT * FROM Users_Rank WHERE user_id='${mentionId}' AND guild_id='${message.guild.id}'`, (err, result) => {
                        if (err) throw err;

                        if(result.length < 0)
                        {
                            const embedMsg = new Discord.MessageEmbed()
                            .setColor('#ff0000')
                            .setTitle('정보가 존재하지 않습니다.');
                            message.channel.send(embedMsg);
                        }
                        else if(result.length === 1)
                        {
                            let winrate = result[0].wins/(result[0].wins+result[0].loses)*100;
                            if(!winrate)
                                winrate = 0;

                            const embedMsg = new Discord.MessageEmbed()
                            .setColor('#E67E22')
                            .setAuthor(`${result[0].displayname}님의 내전정보`, `${target.displayAvatarURL()}`)
                            .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[result[0].tier]}.png?`)
                            .addFields(
                                { name: '티어', value: `${rank_name[result[0].tier]}`, inline: true },
                                { name: '점수', value: `${result[0].points}`, inline: true },
                            )
                            .addFields(
                                { name: '승/패/승률', value: `${result[0].wins} / ${result[0].loses} / ${winrate.toFixed(2)}%`, inline: false },
                            )
                            message.channel.send(embedMsg);
                        }
                    });
                }
                else
                {
                    const embedMsg = new Discord.MessageEmbed()
                        .setColor('#ff0000')
                        .setTitle('멘션으로 입력해야 합니다.');
                    message.channel.send(embedMsg);
                }
            }
            else if(args[0] === '팀')
            {
                if(args[1] < saveLimit) // 저장위치 인지
                {   
                    conn.query(`SELECT * FROM Rank_Team WHERE position='${args[1]}' AND guild_id='${message.guild.id}'`, (err, result) => {
                        if (err) throw err;

                        if(result.length < 1) // 없는 경우
                        {
                            const embedMsg = new Discord.MessageEmbed()
                            .setColor('#ff0000')
                            .setTitle(`해당 번호에 내전이 존재하지 않습니다.`);
                            return message.channel.send(embedMsg);
                        }
                        else if(result.length >= 1)
                        {
                            let playersName_db = []; // db에서 닉네임을 불러와 저장
                            let playersTier_db = []; // db에서 티어를 불러와 저장
                            let playersPoint_db = []; // db에서 점수를 불러와 저장
                            let ateam = '';
                            let bteam = '';
                            let apower = 0;
                            let bpower = 0;

                            for(let i=1; i<11; i++)
                            {
                                let temp = `result[0].player${i}_id`;
                                conn.query(`SELECT * FROM Users_Rank WHERE guild_id='${message.guild.id}' AND user_id='${eval(temp)}'`, (err, result2) => {
                                    if (err) throw err;                     
                                    playersName_db[i-1] = result2[0].displayname;
                                    playersTier_db[i-1] = result2[0].tier;
                                    playersPoint_db[i-1] = result2[0].points;

                                    if(i-1<5)
                                    {
                                        ateam += "[" + rank_name[playersTier_db[i-1]] + "] " + playersName_db[i-1] + " [" + playersPoint_db[i-1] + ']\n';
                                        apower += playersPoint_db[i-1];
                                    }
                                    else if(i-1>=5)
                                    {
                                        bteam += "[" + rank_name[playersTier_db[i-1]] + "] " + playersName_db[i-1] + " [" + playersPoint_db[i-1] + ']\n';
                                        bpower += playersPoint_db[i-1];
                                        if(i-1>=9)
                                        {
                                            const embedMsg = new Discord.MessageEmbed()
                                            .setColor('#F1C40F')
                                            .setTitle("######### 내전 #########")
                                            .addFields(
                                                { name: ':blue_square: A팀\u200B', value: `${ateam}:fire:  ${apower}`, inline: true },
                                                { name: ':red_square: B팀\u200B', value: `${bteam}:fire:  ${bpower}`, inline: true }
                                            );
                
                                            message.channel.send(embedMsg);
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
                else
                {
                    const embedMsg = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle(`${prefix}내전 승 0~2(저장위치)`);
                    message.channel.send(embedMsg);
                }
            }
            else if(args[0] === '순위')
            {
                conn.query(`SELECT displayname, points, tier,   ROW_NUMBER() OVER (ORDER BY points desc) FROM Users_Rank LIMIT 10`, (err, result) => {
                    if (err) throw err;
                
                    let rankList = '';
                    for(let i=0;i<result.length;i++)
                    {
                        rankList += i+1 + ". " + `[${result[i].displayname}]` + "(" + result[i].points + ") - " + rank_name[result[i].tier] + "\n";
                    }
                    str = "```md\n" + "# 내전 순위 TOP 10\n" + rankList + "```";
                    message.channel.send(str);
                });
            }   
            conn.release();
        });
    }
};

function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return mention;
    }
}

function sleep(ms) {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}