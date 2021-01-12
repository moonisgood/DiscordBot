const Discord = require("discord.js");
const connection = require("../db/dbSet.js");
const { prefix } = require('../config.js');


const rank_name = ['배치', '아이언 4','아이언 3','아이언 2','아이언 1','브론즈 4','브론즈 3','브론즈 2','브론즈 1','실버 4','실버 3','실버 2','실버 1','골드 4','골드 3','골드 2','골드 1','플래티넘 4','플래티넘 3','플래티넘 2','플래티넘 1','다이아몬드 4','다이아몬드 3', '다이아몬드 2', '다이아몬드 1', '마스터', '그랜드 마스터', '챌린저'];
const rank_image = ['default', 'iron_4','iron_3','iron_2','iron_1','bronze_4','bronze_3','bronze_2','bronze_1','silver_4','silver_3','silver_2','silver_1','gold_4','gold_3','gold_2','gold_1','platinum_4','platinum_3','platinum_2','platinum_1','diamond_4','diamond_3', 'diamond_2', 'diamond_1', 'master_1', 'grandmaster_1', 'challenger_1'];

var rankManager = {};

rankManager.win = function(message, args) {
    let mention = args[0];
    const embedMsg = new Discord.MessageEmbed()
    
    connection.query(`SELECT * FROM Lol_private_rank WHERE user_id='${mention.id}' AND guild_id=${message.guild.id}`, (err, result) => {
        if (err) throw err;
        
        if(result.length < 1) {
            embedMsg
            .setColor('#ff0000')
            .addField('시스템', `데이터가 존재하지 않습니다. 해당 유저가 \`${prefix}내전정보\`를 통해 생성할 수 있습니다.`)
            
            message.channel.send(embedMsg);
        }

        else if(result.length === 1) {
            let nowPoints = result[0].rift_points;
            let nowMMR = result[0].rift_mmr;
            let nowRank = result[0].rift_rank;
            let upPoints = Math.round(nowPoints + (10+(result[0].rift_mmr/2)));
            let maxMMR = 50;
            let placementMatches = result[0].rift_placementMatches;
            let placementMatchPoints = result[0].rift_placementMatchPoints
            let maxLP = 100; 


            if(nowRank > rank_name.length-4) // 마스터 승급
            {
                if(nowRank === 25 && upPoints >= 200)
                {
                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]} -> ${rank_name[nowRank+1]}:up:`)
                    .setDescription(`리그 포인트 : ${nowPoints} -> ${upPoints}(+${upPoints-nowPoints}):up:`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank+1]}.png?`)

                    message.channel.send(embedMsg);
                    nowRank += 1;
                    nowPoints = upPoints;
                }
                else if(nowRank === 26 && upPoints >= 500)
                {
                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]} -> ${rank_name[nowRank+1]}:up:`)
                    .setDescription(`리그 포인트 : ${nowPoints} -> ${upPoints}(+${upPoints-nowPoints}):up:`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank+1]}.png?`)

                    message.channel.send(embedMsg);
                    nowRank += 1;
                    nowPoints = upPoints;
                }
                else
                {
                embedMsg
                .setColor('#0000FF')
                .setAuthor(result[0].displayname)
                .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                .setDescription(`리그 포인트 : ${nowPoints} -> ${upPoints}(+${upPoints-nowPoints}):up:`)
                .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)
                
                message.channel.send(embedMsg);
                nowPoints = upPoints;
                }
            }
            else if(placementMatches < 5)
            {
                placementMatches += 1;
                placementMatchPoints += 0.5;
                
                if(placementMatches === 5)
                {
                    nowRank = Math.round(placementMatchPoints)+1;

                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                    .setDescription(`배치 완료 : ${placementMatches} / 5`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)
    
                    message.channel.send(embedMsg);
                }
                else
                {
                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                    .setDescription(`배치 중 : ${placementMatches} / 5`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)
    
                    message.channel.send(embedMsg);
                }
            }
            else if(upPoints >= maxLP && (nowRank < rank_name.length))
            {
                embedMsg
                .setColor('#0000FF')
                .setAuthor(result[0].displayname)
                .setTitle(`현재 등급 : ${rank_name[nowRank]} -> ${rank_name[nowRank+1]}:up:`)
                .setDescription(`리그 포인트 : ${nowPoints} -> 0(+${100-nowPoints}):up:`)
                .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank+1]}.png?`)
                
                message.channel.send(embedMsg);
                nowRank += 1;
                nowPoints = 0;
            }
            else if(upPoints < maxLP && (nowRank < rank_name.length))
            {
                embedMsg
                .setColor('#0000FF')
                .setAuthor(result[0].displayname)
                .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                .setDescription(`리그 포인트 : ${nowPoints} -> ${upPoints}(+${upPoints-nowPoints}):up:`)
                .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)

                message.channel.send(embedMsg);
                nowPoints = upPoints;
            }

            if(nowMMR < maxMMR)
                nowMMR += 5;

            connection.query(`UPDATE Lol_private_rank SET rift_wins=rift_wins+1, rift_rank=${nowRank}, rift_points=${nowPoints}, rift_mmr=${nowMMR}, rift_placementMatches=${placementMatches}, rift_placementMatchPoints=${placementMatchPoints} WHERE guild_id='${message.guild.id}' AND user_id='${mention.id}'`);
        }
    });
};

rankManager.lose = function(message, args) {
    let mention = args[0];
    const embedMsg = new Discord.MessageEmbed()
    
    connection.query(`SELECT * FROM Lol_private_rank WHERE user_id='${mention.id}' AND guild_id=${message.guild.id}`, (err, result) => {
        if (err) throw err;
        
        if(result.length < 1) {
            embedMsg
            .setColor('#ff0000')
            .addField('시스템', `데이터가 존재하지 않습니다. 해당 유저가 \`${prefix}내전정보\`를 통해 생성할 수 있습니다.`)
            
            message.channel.send(embedMsg);
        }

        else if(result.length === 1) 
        {
            let nowPoints = result[0].rift_points;
            let nowMMR = result[0].rift_mmr;
            let nowRank = result[0].rift_rank;
            let downPoints = Math.round(35+(-result[0].rift_mmr/4));
            let minMMR = 0;
            let placementMatches = result[0].rift_placementMatches;
            let placementMatchPoints = result[0].rift_placementMatchPoints
            let minLP = 0;
            let maxLP = 100; 
            let masterCheck = false;


            if(nowRank > rank_name.length-4) // 마스터 이상 강등
            {
                if(nowRank === 25 && nowPoints-downPoints <= minLP)
                {
                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]} -> ${rank_name[nowRank-1]}:small_red_triangle_down:`)
                    .setDescription(`리그 포인트 : ${nowPoints} -> 50:small_red_triangle_down:`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank-1]}.png?`)

                    message.channel.send(embedMsg);
                    nowRank -= 1;
                    nowPoints = 50;

                    masterCheck = true;
                }
                else if(nowRank === 26 && nowPoints-downPoints <= 200)
                {
                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]} -> ${rank_name[nowRank-1]}:small_red_triangle_down:`)
                    .setDescription(`리그 포인트 : ${nowPoints} -> ${nowPoints-downPoints}(-${nowPoints-(nowPoints-downPoints)}):small_red_triangle_down:`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank-1]}.png?`)

                    message.channel.send(embedMsg);
                    nowRank -= 1;
                    nowPoints = nowPoints-downPoints;
                   
                    masterCheck = true;
                }
                else if(nowRank === 27 && nowPoints-downPoints <= 500)
                {
                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]} -> ${rank_name[nowRank-1]}:small_red_triangle_down:`)
                    .setDescription(`리그 포인트 : ${nowPoints} -> ${nowPoints-downPoints}(-${nowPoints-(nowPoints-downPoints)}):small_red_triangle_down:`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank-1]}.png?`)

                    message.channel.send(embedMsg);
                    nowRank -= 1;
                    nowPoints = nowPoints-downPoints;

                    masterCheck = true;
                }
            }

            if(placementMatches < 5)
            {
                placementMatches += 1;
                if(placementMatchPoints > 0 && placementMatchPoints < 3)
                    placementMatchPoints -= 0.5;
                
                if(placementMatches === 5)
                {
                    nowRank = Math.round(placementMatchPoints)+1;

                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                    .setDescription(`배치 완료 : ${placementMatches} / 5`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)
    
                    message.channel.send(embedMsg);
                }
                else
                {
                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                    .setDescription(`배치 중 : ${placementMatches} / 5`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)
    
                    message.channel.send(embedMsg); 
                }
            }
            else if(nowRank === 1 && nowPoints === 0) // 아이언 4
            {
                embedMsg
                .setColor('#0000FF')
                .setAuthor(result[0].displayname)
                .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                .setDescription(`리그 포인트 : ${nowPoints}`)
                .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)
                 
                message.channel.send(embedMsg);
            }
            else if(nowRank === 1 && nowPoints-downPoints <= minLP)
            {
                console.log(nowPoints-downPoints);
                embedMsg
                .setColor('#0000FF')
                .setAuthor(result[0].displayname)
                .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                .setDescription(`리그 포인트 : ${nowPoints} -> ${minLP}(-${nowPoints}):small_red_triangle_down:`)
                .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)

                message.channel.send(embedMsg);
                nowPoints = 0;
            }
            else if(nowPoints-downPoints <= minLP && (nowRank > 1 && nowRank < rank_name.length)) // 강등
            {
                embedMsg
                .setColor('#0000FF')
                .setAuthor(result[0].displayname)
                .setTitle(`현재 등급 : ${rank_name[nowRank]} -> ${rank_name[nowRank-1]}:small_red_triangle_down:`)
                .setDescription(`리그 포인트 : ${nowPoints} -> ${maxLP+(-nowPoints-downPoints)}(-${nowPoints-(nowPoints-downPoints)}):small_red_triangle_down:`)
                .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank+1]}.png?`)
                
                message.channel.send(embedMsg);
                nowRank -= 1;
                nowPoints = maxLP+(-nowPoints-downPoints);
            }
            else if(nowPoints-downPoints > minLP && nowRank < rank_name.length && !masterCheck) // 점수만 깎임
            {
                    embedMsg
                    .setColor('#0000FF')
                    .setAuthor(result[0].displayname)
                    .setTitle(`현재 등급 : ${rank_name[nowRank]}`)
                    .setDescription(`리그 포인트 : ${nowPoints} -> ${nowPoints-downPoints}(-${nowPoints-(nowPoints-downPoints)}):small_red_triangle_down:`)
                    .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[nowRank]}.png?`)

                    message.channel.send(embedMsg);
                    nowPoints = nowPoints-downPoints;
            }

            if(nowMMR > minMMR)
                nowMMR -= 5;

            connection.query(`UPDATE Lol_private_rank SET rift_loses=rift_loses+1, rift_rank=${nowRank}, rift_points=${nowPoints}, rift_mmr=${nowMMR}, rift_placementMatches=${placementMatches}, rift_placementMatchPoints=${placementMatchPoints} WHERE guild_id='${message.guild.id}' AND user_id='${mention.id}'`);
        }
    });
};

module.exports = rankManager;