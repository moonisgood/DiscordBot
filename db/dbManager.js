exports.dbSetFunc = function () {

    var mysql = require('mysql');

    var connection = mysql.createConnection({
        host: 'klbcedmmqp7w17ik.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'uwr7d8mquqnvnq61',
        password: 'xulwnpy16mr8vysq',
        database: 'frvx88qhfit05sd5'
    });

    connection.connect(function (err) {
        if (err) throw err;
        console.log("Connected successfully");
    })
}

exports.dbInsertFunc = function() {
    connection.query(`INSERT INTO users (id, guild_id, name, money_blue, money_orange) VALUES (${msg.member.id}, ${msg.guild.id}, '${name}', 0, 0)`, err => {
                
        if(err) throw err;
        console.log(`id:${msg.member.id}, guild_id:${msg.guild.id}, name:'${name}', 파랑정수:0, 주황정수:0`);
    });
}

if (command === 'ping') {
    msg.reply('Pong!');
    var name = msg.member.displayName;
    console.log(msg.member.name);
    if (!msg.member.displayName)
        name = msg.member.name;

    connection.query(`INSERT INTO users (id, guild_id, name, money_blue, money_orange) VALUES (${msg.member.id}, ${msg.guild.id}, '${name}', 0, 0)`, err => {

        if (err) throw err;
        console.log(`id:${msg.member.id}, guild_id:${msg.guild.id}, name:'${name}', 파랑정수:0, 주황정수:0`);
    });
    connection.end();