const Discord   = require("discord.js");
const client    = new Discord.Client();
const config    = require("./config");
const https     = require("https");
const Riot      = require("./Riot");
const champions = require("./champions.js");

client.on('ready', () => {
    console.log('I am ready!');
<<<<<<< HEAD
  });
=======
});
>>>>>>> 696c37e108da732e5cd3ee42db5c8c7c2b0f0f75

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
<<<<<<< HEAD
          let url = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/'+data.id+'?api_key='+config.api_key;
          Request(message, url, (rankData) => {
              // let queue = params[2]
              let index = getQueueIndex("RANKED_SOLO_5x5", rankData);
              message.reply(rankData[index].tier + " "+rankData[index].rank);
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
                let index = getQueueIndex(queue, rankData);
                message.reply(Math.round(rankData[index].wins / (rankData[index].losses + rankData[index].wins) * 1000) / 1000 + "%");
              } catch(err){
                message.reply("Usage: !rank <summoner> <queue>[solo, flex]");
              }
          });
        });
    } else if(params[0] === "") {

    }


});
/**
 *
 * @param {*} message
=======
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
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key=RGAPI-fb155021-23cc-4070-98b2-d36f1837e462';
        Request(message, url, (data) => {
            var championID = getChampID(params[2]);
            let url = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/' + data.id + '/by-champion/' + championID + `?api_key=${config.api_key}`;
            Request(message, url, (stuff) => {
                console.log(stuff);
                message.reply(stuff.championLevel);
            });
        });
    }

});
/**
 *
 * @param {*} message Object for reading and send messages
>>>>>>> 696c37e108da732e5cd3ee42db5c8c7c2b0f0f75
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
function getQueueIndex (q, arr){
  for (var i = 0; i < arr.length; i++){
    if(arr[i].queueType === q){
      return i;
    }
  }
  return -1;
}
<<<<<<< HEAD



=======
function getChampID(input){
  return champions.champList.data[input].id;
}
>>>>>>> 696c37e108da732e5cd3ee42db5c8c7c2b0f0f75

client.login(config.token);
