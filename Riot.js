const https     = require("https");
var RiotApi = (function(){
    function test(message){
        https.get('https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/RiotSchmick?api_key=RGAPI-fb155021-23cc-4070-98b2-d36f1837e462', (resp) => {
            let data = '';           
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
              data += chunk;
            });           
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
              message.reply(JSON.parse(data).name);
            });   
          }).on("error", (err) => {
            console.log("Error: " + err.message);
          });
    }
    return {
        test: function(message){
            test(message);
        },
        myfunction: function(){
            console.log("hello");
        }
    };
})();

module.exports = RiotApi;