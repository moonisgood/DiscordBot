const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs'); // 파일 입출력
const moment = require('moment');

const commands = JSON.parse(fs.readFileSync('Storage/commands.json', 'utf8'));
const champion = JSON.parse(fs.readFileSync('Storage/champion.json', 'utf8'));

let userData = JSON.parse(fs.readFileSync('Storage/userData.json', 'utf8'));

// 전역 설정
const prefix = '~';

// 리스너 이벤트
bot.on('message', message => {
  // 메세지 무시
  if(message.author.bot) return;
  if(message.channel.type === 'dm') {
    message.channel.send('채널에서 입력해주세요!');
    return;
  }

  // 변수
  let sender = message.author; // 메세지 보낸 사람
  let msg = message.content.toUpperCase(); // 메세지
  let cont = message.content.slice(prefix.length).split(" ");
  let args = cont.slice(1);
  let idCheck = `${sender.id}${message.guild.id}`;
  let adminId = '250664648066596864343770014156849152'

  let userData = JSON.parse(fs.readFileSync('Storage/userData.json', 'utf8'));

  // 데이터 초기화
  // 아이디 + 서버아이디 저장
  if(!userData[idCheck]) {
    userData[idCheck] = {}
    userData[idCheck].money = 1000;
    userData[idCheck].lastDaily = '출석 가능';
    userData[idCheck].status = '';
    console.log(`ID : ${sender.id} | GUILD : ${message.guild.id} 데이터가 저장되었습니다.`)
  }
  // 보유 챔피언 저장
  if(!userData[idCheck].hasChampions) {
    userData[idCheck].hasChampions = '';
  }

  // HELP 명령어
  if(msg.startsWith(prefix + 'HELP')) {
    if(msg === `${prefix}HELP`) {
      // Start of the embed
      const embed = new Discord.RichEmbed().setColor(0x1D82B6)

      // Variables
      let commandsFound = 0; // 전체 명령어 갯수

      // Command Loop
      for(var cmd in commands) {
        if(commands[cmd].group.toUpperCase() === 'USER'){
          commandsFound++;
          embed.addField(`${commands[cmd].name}`, `**설명:** ${commands[cmd].desc}\n**사용법:** ${prefix + commands[cmd].usage}`);
        }
        embed.setDescription(`**${commandsFound}개의 \`USER\` 명령어를 찾았습니다.**`)
      }
      message.author.send({embed})
      message.channel.send({embed:{
        color: 0x1D82B6,
        description: `**개인 메세지를 확인하세요. ${message.author}!**`
      }})
    } else if (args.join(" ").toUpperCase() === 'GROUPS') {
      // 변수
      let groups = '';

      for(var cmd in commands) {
        if(!groups.includes(commands[cmd].group)) {
          groups += `${commands[cmd].group}\n`
        }
      }
      message.channel.send({embed: {
        description:`**${groups}**`,
        title:"모든 그룹",
        color: 0x1D82B6,
      }})
      return;

    } else {
      // 변수
      let groupFound = '';

      for(var cmd in commands) {
        if(args.join(" ").trim().toUpperCase() === commands[cmd].group.toUpperCase()) {
          groupFound = commands[cmd].group.toUpperCase();
          break;
        }
      }

      const embed = new Discord.RichEmbed().setColor(0x1D82B6)

      // Variables
      let commandsFound = 0; // 전체 명령어 갯수

      if(groupFound != '') {
        for(var cmd in commands) {
          if(commands[cmd].group.toUpperCase() === groupFound){
            commandsFound++;
            embed.addField(`${commands[cmd].name}`, `**설명:** ${commands[cmd].desc}\n**사용법:** ${prefix + commands[cmd].usage}`);
          }
          embed.setDescription(`**${commandsFound}개의 '${groupFound}'명령어를 찾았습니다.**`)
        }
        message.author.send({embed})
        message.channel.send({embed:{
          color: 0x1D82B6,
          description: `**개인 메세지를 확인하세요. ${message.author}!**`
        }})
        return;
      }

      // 변수
      let commandFound = '';
      let commandDesc = '';
      let commandUsage ='';
      let commandGroup = '';

      for(var cmd in commands) {

          if(args.join(" ").trim().toUpperCase() === commands[cmd].name.toUpperCase()) {
            commandFound = commands[cmd].name;
            commandDesc = commands[cmd].desc;
            commandUsage = commands[cmd].usage;
            commandGroup = commands[cmd].group;
            break;
          }
        }

        if(commandFound === '') {
          message.channel.send({embed: {
            description:`**그룹 또는 명령어를 찾을 수 없습니다. "\`${args.join(" ")}\`"**\n[-help groups]를 통해 모든 그룹을 확인하실 수 있습니다.`,
          }})
          return;
        }

        message.channel.send({embed:{
        color: 0x1D82B6,
        fields: [{
          name:commandFound,
          value:`**설명:** ${commandDesc}\n**사용법:** ${prefix + commandUsage}\n**그룹:** ${commandGroup}`
        }]
      }})
    }
  }

  // 내정보 보기
  if(msg === prefix + '내정보') {
    const embed = new Discord.RichEmbed().setColor(0xFFD700)
    embed.setThumbnail(sender.avatarURL)
    embed.addField(`닉네임` , `${sender.username}`)
    embed.addField(`보유정수`, `${userData[idCheck].money}개`)
    embed.addField(`출석 날짜`, `${userData[idCheck].lastDaily}`)
    message.channel.send(embed)
  }

  // 오늘의 보상
  if(msg === prefix + '출석')
  {
    const embed = new Discord.RichEmbed().setColor(0xFFD700)

    if(userData[idCheck].lastDaily != moment().format('L')) {
      userData[idCheck].lastDaily = moment().format('L');
      userData[idCheck].money += 1000;

      embed.addField('오늘의 보상', '파란정수 1000개를 획득하셨습니다!')
    } else {
      embed.addField('오늘의 보상', '오늘의 보상을 이미 획득하셨습니다.')
    }
      message.channel.send(embed)
  }

  if(msg.startsWith(prefix + '숫자게임')) {
    let randomNumber = Math.floor(Math.random() * (100))+1;
    const embed = new Discord.RichEmbed().setColor(0xFFD700)

    if(msg === `${prefix}숫자게임`)
    {
      message.channel.send(prefix + '숫자게임 [1~100]')
    }
    else if (args.join(" ") === randomNumber)
    {
      embed.addField(`숫자게임 당첨! YOU:[${args.join(" ")}], RIGHT:[${randomNumber}]`, '파란정수 1000개를 지급합니다.')
      userData[idCheck].money += 1000;
    }
    else
    {
      embed.setColor(0xDF0000)
      embed.addField(`숫자게임 낙첨! YOU:[${args.join(" ")}], RIGHT:[${randomNumber}]`, '다음 기회에~ ㅠㅠ')
    }
    message.channel.send(embed)
  }

  // 리붓
  if(sender.id === '250664648066596864')
  {
    if(msg === 'R'){
      bot.disconnect()
    }
  }

  // 보유 챔피언 확인하기
  if(msg === prefix + '보유챔피언'){
    if(userData[idCheck].hasChampions === '')
    {
      const embed = new Discord.RichEmbed().setColor(0xFFD700)

      embed.addField('보유중인 챔피언이 없습니다.', `${prefix}챔피언상자로 구입하세요!`)
      message.channel.send(embed)
    }

    else
    {
      let champions = '';

      for(var i in champion){
        if(userData[idCheck].hasChampions.includes(`|${champion[i].id}|`))
        {
          champions += `**${champion[i].name}**\nID: ${champion[i].id}\n`;
        }
      }
      message.author.send(champions)
      message.channel.send({embed:{
        color: 0x1D82B6,
        description: `**개인 메세지를 확인하세요. ${message.author}!**`
      }})
    }
  }

  // 챔피언 상자 열기
  if(msg === prefix + '챔피언상자') {
    if(userData[idCheck].money >= 500)
    {
      userData[idCheck].money -= 500;
      var rand = Math.floor(Math.random() * (Object.keys(champion).length))+1;

      for(var i in champion){

        if(rand === champion[i].id)
        {
          const embed = new Discord.RichEmbed()

          message.channel.send({embed:{
            color: 0xDF0000,
            description: '**파란정수 500개가 사용되었습니다.**'
          }})

          if(userData[idCheck].hasChampions.includes(`|${champion[i].id}|`)) {
            embed.setColor(0xDF0000)
            embed.addField(`상자에서 '${champion[i].name}'이(가) 나왔습니다!`, '이미 가지고 계신 챔피언으로 파란정수 300으로 전환됩니다.')
            userData[idCheck].money += 300;
          }
          else {
            embed.setColor(0xFFD700)
            embed.addField(`상자에서 '${champion[i].name}'이(가) 나왔습니다!`, '새로운 챔피언을 획득하셨습니다.')
            userData[idCheck].hasChampions += `|${champion[i].id}|`;
          }
          embed.attachFile(champion[i].image)
          message.channel.send(embed)
        }
      }
    }
    else
    {
      const embed = new Discord.RichEmbed().setColor(0xFFD700)
      embed.addField('챔피언 상자를 사기에 파란정수가 부족합니다. 필요한 파란정수: 500개', `보유 정수: ${userData[idCheck].money}`)
      message.channel.send(embed)
    }
  }

  // 요뚜기 전당
  if(msg === '요뚜기')
  {
    message.channel.send({files: ["./images/capture/ddoogi.png"]})
  }

  if(msg === '요뚜기2')
  {
    message.channel.send({files: ["./images/haha/yoddoogi.jpg"]})
  }
  // 요뚜기 전당

  // 하하
  if(msg === '귤드실?') {
    message.channel.send({files: ["./images/haha/mandarin.jpg"]})
  }

  if(msg === '월요일 좋아') {
    message.channel.send({files: ["./images/haha/monday.jpg"]})
  }
  // 하하

  // 데이터 쓰기
  fs.writeFile('Storage/userData.json', JSON.stringify(userData), (err) => {
    if(err) console.error(err);
  })
})


bot.on('ready', () => {
  console.log('Bot started.')
  bot.user.setGame(`명령어보기 ${prefix}help`)
})

bot.login(process.env.TOKEN);
