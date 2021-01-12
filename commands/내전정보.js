const Discord = require("discord.js");
const connection = require("../db/dbSet.js");
//const rankManager = require("../function/rankManager.js");

const rank_name = ['배치', '아이언 4','아이언 3','아이언 2','아이언 1','브론즈 4','브론즈 3','브론즈 2','브론즈 1','실버 4','실버 3','실버 2','실버 1','골드 4','골드 3','골드 2','골드 1','플래티넘 4','플래티넘 3','플래티넘 2','플래티넘 1','다이아몬드 4','다이아몬드 3', '다이아몬드 2', '다이아몬드 1', '마스터', '그랜드 마스터', '챌린저'];
const rank_image = ['default', 'iron_4','iron_3','iron_2','iron_1','bronze_4','bronze_3','bronze_2','bronze_1','silver_4','silver_3','silver_2','silver_1','gold_4','gold_3','gold_2','gold_1','platinum_4','platinum_3','platinum_2','platinum_1','diamond_4','diamond_3', 'diamond_2', 'diamond_1', 'master_1', 'grandmaster_1', 'challenger_1'];

module.exports = {
    name: '내전정보',
    description: '내전 정보를 확인합니다.',
    guildOnly: true, // DM에서 불가능
    execute(message, args) {
        const nickname = message.member.displayName;
        const embedMsg = new Discord.MessageEmbed();

        connection.query(`SELECT * FROM Lol_private_rank WHERE user_id=${message.member.id} AND guild_id=${message.guild.id}`, (err, result) => {
            if (err) throw err;

            if(result.length < 1) {
                connection.query(`INSERT INTO Lol_private_rank (user_id, guild_id, tagname, displayname, rift_wins, rift_loses, rift_rank, rift_points, rift_mmr, rift_placementMatches, rift_placementMatchPoints) VALUES ('${message.member.id}', '${message.guild.id}', '${message.member.user.tag}', '${nickname}' , 0, 0, 0, 0, 50, 0, 0)`);

                embedMsg
                .setColor('#ff0000')
                .addField('시스템', '랭크 정보가 없어 생성했습니다. 명령어를 다시 입력해주세요.')
                
                message.channel.send(embedMsg);
            }
                
            else if(result.length === 1)
            {
                if(result[0].displayaname != nickname)
                {
                    connection.query(`UPDATE Lol_private_rank SET displayname = '${nickname}' WHERE user_id=${message.member.id} AND guild_id=${message.guild.id}`);
                }

                const wins = result[0].rift_wins;
                const loses = result[0].rift_loses;
                const rank = result[0].rift_rank;
                const lp = result[0].rift_points;
                const winning_rate = wins/(wins+loses)*100;

                embedMsg
                .setColor('#0000FF')
                .setAuthor(nickname, message.author.displayAvatarURL())
                .setTitle(`현재 등급 : ${rank_name[result[0].rift_rank]}`)
                .setDescription(`리그 포인트 : ${result[0].rift_points}`)
                .addField("전적", `${result[0].rift_wins + result[0].rift_loses}전 ${result[0].rift_wins}승 ${result[0].rift_loses}패 (${winning_rate.toFixed(2)}%)`)
                //.setImage("https://opgg-static.akamaized.net/images/medals/diamond_1.png?")
                .setThumbnail(`https://opgg-static.akamaized.net/images/medals/${rank_image[result[0].rift_rank]}.png?`)
                .setTimestamp()
                .setFooter("검색한 시간")
                message.channel.send(embedMsg); 
            }
        });
    },
};