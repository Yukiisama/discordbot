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
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {
            message.reply(data.summonerLevel);
        });
    } else if(params[0] === "!rank"){
        let url = 'https://na1.api.riotgames.com/lol/league/v3/leagues/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {

            }
        }
    } else if(params[0] === "!winrate") {
      let url = 'https://na1.api.riotgames.com/lol/league/v3/leagues/'+params[1]+'?api_key='+config.api_key;
      Request(message, url, (data) => {
        let url = 'https://na1.api.riotgames.com/lol/league/v3/positions/bysummoner/'+data.id+'?api_key='+config.api_key;
          Request (message, url, () => {
            message.reply(data.wins / data.losses);
    } else if(params[0] === "!hasChest" || "!haschest") {

    }

});
/**
 *
 * @param {*} message
 * @param {*} params {name:""}
 * @param {*} callback
 */
// ======== REQUEST FUNCTIONS =====
function Request(message, url, callback){
    https.get(url, (resp) => {
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
