/*jshint esversion: 6 */
const Discord   = require("discord.js");
const https     = require("https");
const config    = require("../config");
const async     = require("async"); 
const Request   = require("./Request");
const champions = require("../champions");
const util      = require("./util");
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
module.exports = (function(){
    function liveGameStats(params, message){
        let url = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'+params[1]+'?api_key='+config.api_key;
        Request(message, url, (data) => {
            let url = 'https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/'+data.id+'?api_key='+config.api_key;
            Request(message, url, (liveData) => {
              if(liveData.status !== undefined && liveData.status.message === "Data not found"){
                    message.channel.send("User not in live game!!");
                    return;
                }
                if(liveData.status !== undefined && liveData.status.status_code > 400 ){
                  message.channel.send(errorMessages(liveData.status.status_code));
                  return;
                }
                let queue = queueMatch[liveData.gameQueueConfigId];
                const embed = new Discord.RichEmbed();
                embed.setColor("#f4f740");
                embed.setAuthor("Live Game Stats", "http://i.imgur.com/xNLs83T.png");
                embed.setTitle(queue); 
                let blueTeam = "", redTeam = "";
                // for(var i in liveData.participants){
                //     if(liveData.participants[i].teamId === 100){ //Blue
                //         blueTeam+=util.formatField(liveData.participants[i])+"\n";
                //     } else {
                //         redTeam+=util.formatField(liveData.participants[i])+"\n";
                //     }
                // }                
                let blueBans = "", redBans = "";
                for(var j in liveData.bannedChampions){
                    let champ = util.getChampFromId(liveData.bannedChampions[j].championId);
                    if(liveData.bannedChampions[j].teamId === 100){ //Blue
                        blueBans+=champ+"\n";
                    } else {
                        redBans+=champ+"\n";
                    }
                }
                let rankedStats = [];
                let redRanked = "", blueRanked = "";
                let summoners = liveData.participants;
                async.each(summoners, function(summoner, callback){
                    let url = 'https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/'+summoner.summonerId+'?api_key='+config.api_key;
                    Request(message, url, (rankData) => {
                        let queue = "RANKED_SOLO_5x5";
                        let index = util.getQueueIndex(queue, rankData, "queueType");
                        let stats = rankData[index];
                        if(stats === undefined) stats = {tier:"Unranked", rank:"",};
                        if(summoner.teamId === 100){
                            blueTeam+=util.formatField(summoner)+"\n";
                            blueRanked+=stats.tier + " "+stats.rank+ "\n";
                        } else {
                            redTeam+=util.formatField(summoner)+"\n";
                            redRanked+=stats.tier+" "+stats.rank+"\n";
                        }
                        rankedStats.push(rankData[index]);
                        callback();
                    });            
                }, function(err){
                    if(err) throw err;
                    embed.addBlankField();
                    embed.addField("Blue Team", blueTeam, true);
                    embed.addField("Ranks", blueRanked, true);
                    embed.addField("Bans", blueBans, true);
                    // embed.addBlankField();
                    embed.addField("Red Team", redTeam, true);
                    embed.addField("Ranks", redRanked, true);
                    embed.addField("Bans", redBans, true);
                    message.channel.send({embed});
                });
                
            });
        });
    }
    function getRankedStats(message, summoners){
        let output = "";
        
    }
    return{
        live: function(params, message){
            liveGameStats(params, message);
        }
    };
})();