const Discord = require('discord.js');

module.exports = {
    name: '뭐먹지',
    description: '봇이 음식을 추천 해드립니다.',
    cooldown: 3,
    execute(message, args) {
        const foods = [ '로제떡볶이','김치볶음밥','돌솥비빔밥','순대국','뚝배기불고기' ];

        let random = Math.floor(Math.random() * foods.length);
        console.log(random);

        
        const embed = new Discord.MessageEmbed()
	        .setTitle(`'${message.member.displayName}'님! '${foods[random]}' 어떠신가요~?`)
	        .attachFiles([`./images/foods/${random}.png`])
	        .setImage(`attachment://${random}.png`);


            message.channel.send(embed);
    }
};  