const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("querystring");

module.exports = {
	name: '롤체전적',
    description: '롤체전적을 보여줍니다.',
    args: true,
    usage: '<닉네임>',
	execute(message, args) {
        const getHtml = async () => {
            try {
              return await axios.get("https://lolchess.gg/profile/kr/" + encodeURI(args.join(" ")));
            } catch (error) {
              console.error(error);
            }
          };
          
          getHtml().then(html => {
              const $ = cheerio.load(html.data);
              const body = $('div.profile');

              const tier_icon = body.find('div.profile__tier__icon').find('img').attr('src');
              const tier_text = body.find('span.profile__tier__summary__tier').text().trim();
              const tier_lp = body.find('span.profile__tier__summary__lp').text().replace(/[^(0-9)]/g, '');

              if(!tier_icon){
                message.channel.send("제대로된 소환사명을 입력해주세요.");
                return;
            }
            
            nickname = "";
            for (var i=0; i<args.length; i++)
            {
                nickname += (" " + args[i]);
            }
            nickname = nickname.slice(1);

            message.channel.send("https:" + tier_icon);
            message.channel.send(`\`${nickname}\`` + "님의 롤토체스 티어는 " + `\`${tier_text} ${tier_lp}\`` + " 입니다.");
        });
    },
};