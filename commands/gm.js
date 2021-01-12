const Discord = require("discord.js");
const fs = require('fs');
const rankManager = require("../function/rankManager.js");

module.exports = {
	name: 'gm',
    description: '관리자 전용 명령어',
    args: true,
    usage: '<user> <role>',
    guildOnly: true, 
    cooldown: 0.5,
	execute(message, args) {

        fs.readFile('./json/admin.json', 'utf8', (error, jsonFile) => {
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
                if(args[1] === "win")
                {
                    rankManager.win(message, args);
                }
                else if(args[1] === "lose")
                {
                    rankManager.lose(message, args);
                }
            }
            else if(!adminCheck)
            {
                const embedMsg = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .addField('시스템', '당신은 관리자 명령어를 사용할 권한이 없습니다.');
                message.channel.send(embedMsg);
            }
        });
    },
};