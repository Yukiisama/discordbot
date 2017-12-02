const Discord   = require("discord.js");
const client    = new Discord.Client();
const config    = require("./config.js");
const https     = require("https");

https.get('https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/RiotSchmick?api_key=RGAPI-fb155021-23cc-4070-98b2-d36f1837e462', (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data));
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
client.on('ready', () => {
    console.log('I am ready!');
  });

client.on('message', message => {
    let params = message.content.split(" ");
    if(message.content === 'ping'){
        message.reply('pong');
    }
    if (params[0] === '!summoner') {

    }
});

  client.login(config.token);
