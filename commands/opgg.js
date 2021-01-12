const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
	name: 'opgg',
    description: '롤전적을 보여줍니다.',
    args: true,
    usage: '<닉네임>',
	execute(message, args) {
        const getHtml = async () => {
          try {
              return await axios.get(`https://www.op.gg/summoner/${encodeURI(args.join(" "))}`,  
              {              /* PC 화면 요청을 위한 header */
                headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Whale/2.8.107.16 Safari/537.36',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
              },
            })
          } catch (error) {
            console.error(error);
            }
          };
          
          getHtml().then(html => {
            const $ = cheerio.load(html.data);

            if ($('div.l-container > div.SummonerNotFoundLayout').length > 0)
              return message.channel.send("등록되지 않은 소환사입니다.");
            else if ($('div.Profile > div.Information > span').length === 0)
              throw Error('op.gg load failed.');

            const name = $('div.Profile > div.Information > span').text();
            const soloRankTier = $('div.TierRank').text().trim();
            const soloRankLP = $('span.LeaguePoints').text().replace(/[^(0-9)]/g, '');


            message.channel.send(name + " 님의 랭크는 " + soloRankTier + " - " + soloRankLP + " 입니다.");
        });
    },
};