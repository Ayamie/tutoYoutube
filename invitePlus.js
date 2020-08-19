const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
client.on("ready", message => {
    console.log('salut je suis prêt');

});

client.on("message", message => {
    if(message.content === `${prefix}ping`) {
        message.channel.send(`🏓 pong - ${client.ws.ping}`)
    }
})

const { prefix, token } = require('./config.json'); 
const client = new Discord.Client(); 
client.commands = new Discord.Collection(); 
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); 
for (const file of commandFiles) { 	
const command = require(`./commands/${file}`); 
client.commands.set(command.name, command); }

client.login('');