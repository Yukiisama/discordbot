const Discord   = require("discord.js");
const moment    = require("moment");
const client    = new Discord.Client();
const config    = require("./config");
const https     = require("https");
const Riot      = require("./Riot");
const champions = require("./champions.js");
const async     = require("async");
const matt      = require("./Matt");
const queueMatch = {
    0: "Custom Game",
    400:"Summoners Rift - 5v5 Draft Pick",
    420: "Summoners Rift - 5v5 Ranked Solo",
    430: "Summoners Rift - 5v5 Blind Pick",
    440: "Summoners Rift - 5v5 Ranked Flex",
    450: "Howling Abyss - 5v5 ARAM",
    460: "Twisted Treeline - 3v3 Blind Pick",
    470: "Twisted Treeline - 3v3 Ranked Flex"
}
client.on('ready', () => {
    console.log('I am ready!');
  });

client.on('message', message => {
    let params = message.content.split(" ");
      if (params[0] === "!commands") {
        const embed = new Discord.RichEmbed();
        embed.setColor("#f4f740");
        embed.setTitle("List of available commands: ");
        embed.setDescription("!level, !rank, !winrate, !mastery, !haschest, !info, !profile");
        message.channel.send({embed});
      } else if(params[0] === "!level") {
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {
            message.channel.send(params[1] + " is level " + data.summonerLevel + ".");
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
                      message.channel.send(params[1] + " is " + rankData[index].tier + " " + rankData[index].rank + " in " + params[2] + " queue.");
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
                  message.channel.send(params[1] + "'s winrate is " + Math.round(rankData[index].wins / (rankData[index].losses + rankData[index].wins) * 1000) / 10 + "% in " + params[2] + " queue.");
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
                  message.channel.send(params[1] + " is mastery level " + stuff.championLevel + " with " + params[2]);
              });
            } catch(err) {
              message.channel.send('Usage: !mastery <summoner> <champion>');
            }
          });
      } else if (params[0] === "!live"){
          let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
          Request(message, url, (data) => {
              let url = 'https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/'+data.id+'?api_key='+config.api_key;
              Request(message, url, (liveData) => {
                if(liveData.status !== undefined && liveData.status.message === "Data not found"){
                      message.channel.send("User not in live game!!");
                      return;
                  }
                  let queue = queueMatch[liveData.gameQueueConfigId];
                  const embed = new Discord.RichEmbed();
                  embed.setColor("#f4f740");
                  embed.setAuthor("Live Game Stats", "http://i.imgur.com/xNLs83T.png");
                  embed.setTitle(queue);
                  let blueTeam = "", redTeam = "";
                  for(var i in liveData.participants){
                      if(liveData.participants[i].teamId === 100){ //Blue
                          blueTeam+=formatField(liveData.participants[i])+"\n";
                      } else {
                          redTeam+=formatField(liveData.participants[i])+"\n";
                      }
                  }
                  let blueBans = "", redBans = "";
                  for(var i in liveData.bannedChampions){
                      let champ = getChampFromId(liveData.bannedChampions[i].championId);
                      if(liveData.bannedChampions[i].teamId === 100){ //Blue
                          blueBans+=champ+"\n";
                      } else {
                          redBans+=champ+"\n";
                      }
                  }
                  embed.addField("Blue Team", blueTeam, true);
                  embed.addField("Bans", blueBans, true);
                  embed.addBlankField();
                  embed.addField("Red Team", redTeam, true);
                  embed.addField("Bans", redBans, true);
                  message.channel.send({embed});
              });
          });
      } else if(params[0] === "!matt"){
          let index = Math.floor(Math.random() * (matt.length-1)) + 1  ;
          message.channel.send(matt[index]);
      } else if (params[0] === "!haschest") {
          let url = `https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/${params[1]}?api_key=${config.api_key}`;
          Request(message, url, (data) => {
              try {
                var championID = getChampID(params[2]);
                let url = `https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/${data.id}/by-champion/${championID}?api_key=${config.api_key}`;
                Request(message, url, (stuff) => {
                    if (stuff.status == undefined) {
                      if (stuff.chestGranted == true) {
                        message.channel.send(params[1] + " has received the chest for " + params[2].toLowerCase().charAt(0).toUpperCase() + params[2].toLowerCase().slice(1) + "!");
                      } else if (stuff.chestGranted == false) {
                        message.channel.send(params[1] + " has not received the chest for " + params[2].toLowerCase().charAt(0).toUpperCase() + params[2].toLowerCase().slice(1) + "!");
                      }
                    } else if (stuff.status != undefined) {
                        message.channel.send("Riot API Error: " + errorMessages(stuff.status.status_code))
                    }
                });
              } catch(err) {
                message.channel.send('Usage: !haschest <summoner> <champion>');
              }
          });
      } else if(params[0] === "!lastplayed") {
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {
          var championID = getChampID(params[2]);
          let url = 'https://na1.api.riotgames.com/lol/static-data/v3/champions/'+championID+'?locale=en_US&tags=image&api_key='+config.api_key;
            Request (message, url, (champData) => {
              try {
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
      } else if (params[0] === "!info") {
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
function getChampID(arg){
  input = arg.toLowerCase().charAt(0).toUpperCase() + arg.toLowerCase().slice(1);
  return champions.champList.data[input].id;
}

function formatField(data){
    let summoner = data.summonerName;
    let champ = getChampFromId(data.championId);
    return summoner+" - "+ champ;
}

function getChampFromId(id){
    for (var key in champions.champList.data) {
        // skip loop if the property is from prototype
        if (!champions.champList.data.hasOwnProperty(key)) continue;
        var obj = champions.champList.data[key];
        if(obj.id === id){ return key;}
    }
    return "Not Found";
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
