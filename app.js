const Discord   = require("discord.js");
const client    = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
  });
  
  client.on('message', message => {
    if (message.content === 'ping') {
      message.reply('pong');
    }
  });
  
  client.login('Mzg2NTMyODgxMjg5NDQ1Mzk0.DQRSaA.PpHQDanjPbbNP-FVgZjPGwKemR4');