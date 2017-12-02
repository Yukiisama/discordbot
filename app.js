const Discord   = require("discord.js");
const client    = new Discord.Client();
const config    = require("./config");
const https     = require("https");
const Riot      = require("./Riot");

client.on('ready', () => {
    console.log('I am ready!');
  });

client.on('message', message => {
    let params = message.content.split(" ");
    if(message.content === 'ping'){
        message.reply('pong');
    } else if(params[0] === "!level"){
<<<<<<< HEAD
        Summoner(message, {name:params[1]}, (data) => {
            message.reply(data.summonerLevel);
        });
    }

=======
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {
            message.reply(data.summonerLevel);
        });
    } else if(params[0] === "!rank"){
        let url = '/lol/league/v3/leagues/'+params[1]+'?api_key='+config.api_key;
        Request
    }  
    
>>>>>>> 2cfbeff674840fc03922ed240ce62521c5f24098
});
/**
 *
 * @param {*} message
 * @param {*} params {name:""}
 * @param {*} callback
 */
// ======== REQUEST FUNCTIONS =====
function Request(message, url, callback){
    https.get('https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params.name+'?api_key=RGAPI-fb155021-23cc-4070-98b2-d36f1837e462', (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            callback(JSON.parse(data));
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
}
function Winrate() {
  https.get()
}
client.login(config.token);
