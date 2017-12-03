const Discord   = require("discord.js");
const client    = new Discord.Client();
const config    = require("./config");
const https     = require("https");
const Riot      = require("./Riot");
const champions = require("./champions.js");

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
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {
            let url = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/'+data.id+'?api_key='+config.api_key;
            Request(message, url, (rankData) => {
                try{
                    var convertQueue = {
                        "flex":"RANKED_FLEX_SR",
                        "solo":"RANKED_SOLO_5x5"
                    }
                    let queue = params[2] !== undefined ? convertQueue[params[2].toLowerCase()] : "RANKED_SOLO_5x5";
                    let index = getQueueIndex(queue, rankData);
                    message.reply(rankData[index].tier + " "+rankData[index].rank);
                } catch(err){
                    message.reply("Usage: !rank <summoner> <queue>[solo, flex]");
                }
            });
        });
    } else if (params[0] === "!mastery") {
        let url = `https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/${params[1]}?api_key=${config.api_key}`;
        Request(message, url, (data) => {
          try{
            var championID = getChampID(params[2]);
            let url = `https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/${data.id}/by-champion/${championID}?api_key=${config.api_key}`;
            Request(message, url, (stuff) => {
                console.log(stuff);
                message.reply(stuff.championLevel);
            });
          } catch(err) {
            message.channel.send('Usage: !mastery <summoner> <champion>');
          }
        });
    } else if (params[0] === "!haschest") {
        let url = `https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/${params[1]}?api_key=${config.api_key}`;
        Request(message, url, (data) => {
            try {
              var championID = getChampID(params[2]);
              let url = `https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/${data.id}/by-champion/${championID}?api_key=${config.api_key}`;
              Request(message, url, (stuff) => {
                  console.log(stuff);
                  if (stuff.status == undefined) {
                    if (stuff.chestGranted == true) {
                      message.reply("you have received the chest for " + params[2].toLowerCase().charAt(0).toUpperCase() + params[2].toLowerCase().slice(1));
                    } else if (stuff.chestGranted == false) {
                      message.reply("you have not received the chest for " + params[2].toLowerCase().charAt(0).toUpperCase() + params[2].toLowerCase().slice(1));
                    }
                  } else if (stuff.status != undefined) {
                      message.channel.send("Riot API Error: " + errorMessages(stuff.status.status_code))
                  }
              });
            } catch(err) {
              message.channel.send('Usage: !haschest <summoner> <champion>');
            }
        });
    }

    else if (params[0] === "!info") {
      let url = `https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/${params[1]}?api_key=${config.api_key}`;
      Request(message, url, (data) => {
        try {
          var championID = getChampID(params[1]);
          let url = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/'+championID+'?locale=en_US&tags=all&api_key='+config.api_key;
          const embedded = new Discord.RichEmbed();
          Request(message, url, (champData) => {
            if (champData.status != undefined) {
              message.channel.send("Riot API Error: " + errorMessages(champData.status.status_code))
            } else if (champData.status == undefined) {
              embedded.setColor("#f4f740");
              embedded.setTitle(`**${champData.name}**`);
              embedded.setDescription(`*${champData.title}*`);
              embedded.setThumbnail(`https://ddragon.leagueoflegends.com/cdn/7.23.1/img/champion/${champData.image.full}`);
              embedded.addField(`Health`, `${champData.stats.hp}+${champData.stats.hpperlevel}`, true);
              embedded.addField(`HP Regen`, `${champData.stats.hpregen}+${champData.stats.hpregenperlevel}`, true);
              embedded.addField(`Mana`, `${champData.stats.mp}+${champData.stats.mpperlevel}`, true);
              embedded.addField(`MP Regen`, `${champData.stats.mpregen}+${champData.stats.mpregenperlevel}`, true);
              embedded.addField("Passive: "+ champData.passive.name, champData.passive.description);
              embedded.addField("Q: "+ champData.spells[0].name, champData.spells[0].description +
                                `\n**Cost**: ${champData.spells[0].cost[0]}/${champData.spells[0].cost[1]}/${champData.spells[0].cost[2]}/${champData.spells[0].cost[3]}/${champData.spells[0].cost[4]}` +
                                `\n**Cooldown**: ${champData.spells[0].cooldown[0]}/${champData.spells[0].cooldown[1]}/${champData.spells[0].cooldown[2]}/${champData.spells[0].cooldown[3]}/${champData.spells[0].cooldown[4]}`, true);
              embedded.addField("W: "+ champData.spells[1].name, champData.spells[1].description +
                                `\n**Cost**: ${champData.spells[1].cost[0]}/${champData.spells[1].cost[1]}/${champData.spells[1].cost[2]}/${champData.spells[1].cost[3]}/${champData.spells[1].cost[4]}` +
                                `\n**Cooldown**: ${champData.spells[1].cooldown[0]}/${champData.spells[1].cooldown[1]}/${champData.spells[1].cooldown[2]}/${champData.spells[1].cooldown[3]}/${champData.spells[1].cooldown[4]}`, true);
              embedded.addField("E: "+ champData.spells[2].name, champData.spells[2].description +
                                `\n**Cost**: ${champData.spells[2].cost[0]}/${champData.spells[2].cost[1]}/${champData.spells[2].cost[2]}/${champData.spells[2].cost[3]}/${champData.spells[2].cost[4]}` +
                                `\n**Cooldown**: ${champData.spells[2].cooldown[0]}/${champData.spells[2].cooldown[1]}/${champData.spells[2].cooldown[2]}/${champData.spells[2].cooldown[3]}/${champData.spells[2].cooldown[4]}`, true);
              embedded.addField("R: "+ champData.spells[3].name, champData.spells[3].description +
                                `\n**Cost**: ${champData.spells[3].cost[0]}/${champData.spells[3].cost[1]}/${champData.spells[3].cost[2]}` +
                                `\n**Cooldown**: ${champData.spells[3].cooldown[0]}/${champData.spells[3].cooldown[1]}/${champData.spells[3].cooldown[2]}`, true);
              message.channel.send(embedded);
            }
          });
        } catch(err) {
          message.channel.send("Usage: !info <champion>");
        }
      })
    }


});
/**
 *
 * @param {*} message Object for reading and send messages
 * @param {*} params {name:""}
 * @param {*} callback Function for task to perform on data response
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
// ========= UTIL FUNCTIONS =========
function getQueueIndex(q, arr){
    for(var i = 0; i < arr.length; i++){
        if(arr[i].queueType === q){
            return i;
        }
    }
    return -1;
}
function getChampID(arg){
  input = arg.toLowerCase().charAt(0).toUpperCase() + arg.toLowerCase().slice(1);
  return champions.champList.data[input].id;
}
function errorMessages(errorCode) {
  switch (errorCode) {
    case 400:
      return "Bad request";
      break;
    case 401:
      return "Unauthorized";
      break;
    case 403:
      return "Forbidden";
      break;
    case 404:
      return "Data not found";
      break;
    case 405:
      return "Method not allowed";
      break;
    case 415:
      return "Unsupported media type";
      break;
    case 429:
      return "Rate limit exceeded";
      break;
    case 500:
      return "Internal service error";
      break;
    case 502:
      return "Bad gateway";
      break;
    case 503:
      return "Service unavailable";
      break;
    case 504:
      return "Gateway timeeout";
      break;
  }
}

client.login(config.token);
