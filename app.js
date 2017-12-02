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
        Summoner(message, {name:params[1]}, (data) => {
            message.reply(data.summonerLevel);
        });
    }
});
/**
 *
 * @param {*} message
 * @param {*} params {name:""}
 * @param {*} callback
 */ 
// ======== REQUEST FUNCTIONS =====
function Summoner(message, params, callback){
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
client.login(config.token);
