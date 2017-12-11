/*jshint esversion: 6 */ 
const config    = require("../config");
const https     = require("https");
// ======== REQUEST FUNCTIONS =====
module.exports = function Request(message, url, callback){
    try{
      https.get(url, (resp) => {
         
          let data = "";
          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });
          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            utfstring = unescape(encodeURIComponent(data));
            try{
              callback(JSON.parse(utfstring));
            } catch (err){
              message.channel.send("Fuck off alex");
              return;
            }
          });        
        }).on("error", (err) => {
          console.log("Error: " + err.message);
        });
      } catch(err){
        console.log(err);
        message.channel.send("No data found! No spaces idiot kid :matt:");
      }
  }