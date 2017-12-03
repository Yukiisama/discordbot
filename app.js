const Discord   = require("discord.js");
const client    = new Discord.Client();
const config    = require("./config");
const https     = require("https");
const Riot      = require("./Riot");
const champions = require("./champions.js");
const async     = require("async");
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
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {
            var championID = getChampID(params[2]);
            let url = 'https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/' + data.id + '/by-champion/' + championID + `?api_key=${config.api_key}`;
            Request(message, url, (stuff) => {
                console.log(stuff);
                message.reply(stuff.championLevel);
            });
        });
    } else if (params[0] === "!live"){
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {
            let url = 'https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/'+data.id+'?api_key='+config.api_key;
            Request(message, url, (liveData) => {             
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
function getChampID(input){
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
function getRankedStats(message,summonerId, rankedData){    
    let url = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/'+summonerId+'?api_key='+config.api_key;
    Request(message, url, (rankData) => {
        try{
            let queue =  "RANKED_SOLO_5x5";
            let index = getQueueIndex(queue, rankData);
            rankedData.push(rankedData);
        } catch(err){
            console.log(err);
        }
    });
}
client.login(config.token);
