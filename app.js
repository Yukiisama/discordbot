const Discord   = require("discord.js");
const moment    = require("moment");
const client    = new Discord.Client();
const config    = require("./config");
const https     = require("https");
const Riot      = require("./Riot");
const champions = require("./champions.js");
const queueMatch = {
    0: "Custom Game",
    420: "Summoners Rift - 5v5 Ranked Solo games",
    430: "Summoners Rift - 5v5 Blind Pick games",
    440: "Summoners Rift - 5v5 Ranked Flex Game",
    450: "Howling Abyss - 5v5 ARAM games",
    460: "Twisted Treeline - 3v3 Blind Pick games",
    470: "Twisted Treeline - 3v3 Ranked Flex games"
}


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
                    let index = getQueueIndex(queue, rankData, "queueType");
                    message.reply(rankData[index].tier + " "+rankData[index].rank);
                } catch(err){
                    message.reply("Usage: !rank <summoner> <queue>[solo, flex]");
                }
            });
        });

    } else if(params[0] === "!winrate") {
      let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
      Request(message, url, (data) => {
        let url = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/'+data.id+'?api_key='+config.api_key;
          Request (message, url, (rankData) => {
            try {
                var convertQueue = {
                  "flex":"RANKED_FLEX_SR",
                  "solo":"RANKED_SOLO_5x5"
                }
                let queue = params[2] !== undefined ? convertQueue[params[2].toLowerCase()] : "RANKED_SOLO_5x5";
                let index = getQueueIndex(queue, rankData, "queueType");
                message.reply(Math.round(rankData[index].wins / (rankData[index].losses + rankData[index].wins) * 1000) / 1000 + "%");
              } catch(err){
                message.reply("Usage: !rank <summoner> <queue>[solo, flex]");
              }
          });
        });

    } else if (params[0] === "!mastery") {
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key=RGAPI-fb155021-23cc-4070-98b2-d36f1837e462';
        Request(message, url, (data) => {
            var championID = getChampID(params[2]);
            let url = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/' + data.id + '/by-champion/' + championID + `?api_key=${config.api_key}`;
            Request(message, url, (stuff) => {
                console.log(stuff);
                message.reply(stuff.championLevel);
            });
        });
    } else if(params[0] === "!lastplayed") {
      let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
      Request(message, url, (data) => {
        var championID = getChampID(params[2]);
        let url = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/'+championID+'?locale=en_US&tags=image&api_key='+config.api_key;
          Request (message, url, (champData) => {
            try {
            console.log(champData);
            const embed = new Discord.RichEmbed();
            embed.setColor("#f4f740");
            embed.setThumbnail ('https://ddragon.leagueoflegends.com/cdn/7.23.1/img/champion/' + champData.image.full);
            let url = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/'+ data.id + '/by-champion/' + championID + '?api_key='+config.api_key;
              Request (message, url, (masteryData) => {
                embed.setAuthor (params[1] + ",")
                embed.setDescription ("You have last played " + "**" + params[2] + "** " + moment(masteryData.lastPlayTime).fromNow() + ".")
                message.channel.send({embed});
            });
          } catch (err) {
            message.channel.send("Usage: !lastplayed <summoner> <champion>");
          }
            });
        });
      } else if(params[0] === "!profile") {
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        const embed = new Discord.RichEmbed();
        Request(message, url, (data) => {
          embed.setColor("#f4f740");
          embed.setAuthor("🌞 " + params[1] + "'s Profile");
          embed.addField("Level: ", data.summonerLevel, true);
          let url = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/'+data.id+'?api_key='+config.api_key;
            Request (message, url, (rankData) => {
                let index = getQueueIndex("RANKED_SOLO_5x5", rankData, "queueType");
                console.log(rankData);
                if (rankData[index] === undefined) {
                  embed.addField("Ranked Stats are unavailable.", "Play your placements!");
                } else {
                  embed.addField("Ranked Stats: ", rankData[index].tier + " " + rankData[index].rank + "\n" + "**Winrate:** " + (Math.round(rankData[index].wins / (rankData[index].losses + rankData[index].wins) * 1000) / 1000 + "%") + " // " + rankData[index].wins + "W" + " " + rankData[index].losses + "L" + "\n" + (rankData[index].leaguePoints) + " LP", true);
                  let string = "";
                  if (rankData[index].veteran === true) {
                    string += "... is a veteran in this tier! \n";
                  }
                  if (rankData[index].freshBlood === true) {
                    string += "... just recently joined this tier! \n"
                  }
                  if (rankData[index].hotStreak === true) {
                    string += "... is on a **hot streak** :fire:! \n";
                  }
                  if (rankData[index].inactive === true) {
                    string += "... is inactive! Play a ranked game to prevent decay. \n";
                  }
                  if (string.length > 0) {
                    embed.addField(params[1], string);
                  }
                }
                message.channel.send({embed});
              });
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

// ==== UTIL FUNCTIONS
function getQueueIndex (q, arr, key){
  for (var i = 0; i < arr.length; i++){
    if(arr[i][key] === q){
      return i;
    }
  }
  return -1;
}

function getChampID(input){
  return champions.champList.data[input].id;
}


client.login(config.token);
