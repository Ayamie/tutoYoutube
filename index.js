﻿const Discord = require("discord.js");
const token = require("./token.json");
const fs = require("fs");
const bdd = require("./bdd.json");
const fetch = require('node-fetch');
const ytdl = require("ytdl-core");

const CronJob = require('cron').CronJob;

const list = require("./youtube.json");

const queue = new Map();

const search = require('youtube-search');

const bot = new Discord.Client();

var job = new CronJob('* * * * *', async function() {
    const data = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCWqPk07TBQAKy695NJMnlZg&key='+token.youtube).then(response => response.json());
        bot.channels.cache.get('738660606621777940').setName('youtube│'+ data.items[0].statistics.subscriberCount + 'abos')
  }, null, true, 'America/Los_Angeles');
job.start();

bot.on("ready", async () => {
    console.log("Le bot est allumé")
    bot.user.setStatus("dnd");
    setTimeout(() => {
        bot.user.setActivity("développer mon bot");
    }, 100)
    const opts = {
            maxResults: 1000,
            key: token.youtube,
            type:'video',
            // channelId: 'UC4KnmRSYO4240Hl201BMgIg' //Chaine de tests
            channelId: 'UCWqPk07TBQAKy695NJMnlZg'
        };

    let channel_new_vid = bot.channels.cache.get("733425809095917749");
   



    setInterval(function(){
        let result = search('', opts).catch(err => console.log(err));
        result.then(function(r) {
            r.results.forEach(element => {
                if(list['vidéos'].indexOf(element.id) == -1){
                    console.log(element.id);
                    channel_new_vid.send("https://www.youtube.com/watch?v=" + element.id)
                    list['vidéos'].push(element.id);
                    fs.writeFile("./youtube.json", JSON.stringify(list, null, 4), (err) => {
                        if (err) message.channel.send("Une erreur est survenue.");
                    });
                }

            });
        })
    },2000)
});

bot.on("guildMemberAdd", member => {
    
    if(bdd["message-bienvenue"]){
        bot.channels.cache.get('701770132812464169').send(bdd["message-bienvenue"]);
    }
    else{
        bot.channels.cache.get('701770132812464169').send("Bienvenue sur le serveur");
    }
    member.roles.add('701156465515167755');

})

bot.on("message", async message => {

    if (message.author.bot) return;

    if(bdd[message.guild.id]["prefix"]){
        prefix = bdd[message.guild.id]["prefix"]
    }else{
        prefix = "!"
    }
    

    if (message.content.startsWith(prefix + "config")) {
        
        let arg = message.content.trim().split(/ +/g)
        console.log(arg)
        if(!arg[1]){
            return message.channel.send(`Vous devez indiquer quel section souhaitez vous configurer`)
        }
        else if (arg[1] == "prefix"){
            if(!arg[2]){
                return message.channel.send(`Vous devez indiquer un prefix`)
            }
            else{
                bdd[message.guild.id]["prefix"] = arg[2]
                Savebdd();
                return message.channel.send(`Le prefix ${arg[2]} à bien été sauvegardé !`);
            }
        }

    }
    
    if (message.content.startsWith("!clear")) {
        // message.delete();
        if (message.member.hasPermission('MANAGE_MESSAGES')) {

            let args = message.content.trim().split(/ +/g);

            if (args[1]) {
                if (!isNaN(args[1]) && args[1] >= 1 && args[1] <= 99) {

                    message.channel.bulkDelete(args[1])
                    message.channel.send(`Vous avez supprimé ${args[1]} message(s)`)
                    message.channel.bulkDelete(1)

                }
                else {
                    message.channel.send(`Vous devez indiquer une valeur entre 1 et 99 !`)
                }
            }
            else {
                message.channel.send(`Vous devez indiquer un nombre de messages a supprimer !`)
            }
        }
        else {
            message.channel.send(`Vous devez avoir la permission de gérer les messages pour éxécuter cette commande !`)
        }
    }

    if (message.content.startsWith("!mb")) {
        message.delete()
        if (message.member.hasPermission('MANAGE_MESSAGES')) {
            if (message.content.length > 5) {
                message_bienvenue = message.content.slice(4)
                bdd["message-bienvenue"] = message_bienvenue
                Savebdd()

            }
        }
    }
    if (message.content.startsWith("!warn")) {
        if (message.member.hasPermission('BAN_MEMBERS')) {

            if (!message.mentions.users.first()) return;
            utilisateur = message.mentions.users.first().id

            if (bdd["warn"][utilisateur] == 2) {

                delete bdd["warn"][utilisateur]
                message.guild.members.ban(utilisateur)

            }
            else {
                if (!bdd["warn"][utilisateur]) {
                    bdd["warn"][utilisateur] = 1
                    Savebdd();
                    message.channel.send("Tu as a présent " + bdd["warn"][utilisateur] + " avertissement(s)");
                }
                else {
                    bdd["warn"][utilisateur]++
                    Savebdd();
                    message.channel.send("Tu as a présent " + bdd["warn"][utilisateur] + " avertissements");

                }
            }
        }
    }
    // commande de stats
    if (message.content.startsWith("!stats")) {
        let onlines = message.guild.members.cache.filter(({ presence }) => presence.status !== 'offline').size;
        let totalmembers = message.guild.members.cache.size;
        let totalservers = bot.guilds.cache.size;
        let totalbots = message.guild.members.cache.filter(member => member.user.bot).size;
        let totalrole = message.guild.roles.cache.get('701156465515167755').members.map(member => member.user.tag).length;

        const monembed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Statistiques')
            .setURL('https://discord.js.org/')
            .setAuthor('Mon Bot discord', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Voici les statistiques du serveur')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields(
                { name: 'Nombre de membrs total', value: totalmembers, inline: true },
                { name: 'Membres connéctés : ', value: onlines, inline: true },
                { name: 'Nombre de serveurs auquel le bot appartient : ', value: totalservers, inline: true },
                { name: 'Nombres de bots sur le serveur : ', value: totalbots, inline: true },
                { name: 'Nombre d\'arrivants : ', value: totalrole, inline: true },
            )
            .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

        message.channel.send(monembed);
    }

    //LEVEL

    if (message.content.startsWith('!lvl')) {
        if (bdd["statut-level"] == true) {
            bdd["statut-level"] = false
            Savebdd();
            return message.channel.send('Vous venez d\'arreter le système de level !');
        }
        else {
            bdd["statut-level"] = true;
            Savebdd();
            return message.channel.send('Vous venez d\'alumer le système de level !');
        }
    }

    if (bdd["statut-level"] == true) {
        if (message.content.startsWith('!level')) {
            if (!bdd["coins-utilisateurs"][message.member.id]){
                return message.channel.send(`Nous n'avez pas encore posté de message !`);
            } else {
                return message.channel.send(`Vous avez ${bdd["coins-utilisateurs"][message.member.id]} points !\nEt vous êtes au level n°${bdd["level-utilisateurs"][message.member.id]}`)
            }
        }
        else{
            addRandomInt(message.member);
            if (!bdd["coins-utilisateurs"][message.member.id]) {
                bdd["coins-utilisateurs"][message.member.id] = Math.floor(Math.random() * (4 - 1) + 1);
                bdd["level-utilisateurs"][message.member.id] = 0;
                Savebdd();
            }
            else if (bdd["coins-utilisateurs"][message.member.id] > 100 && bdd["coins-utilisateurs"][message.member.id] < 250) {
                if (bdd["level-utilisateurs"][message.member.id] == 0) {
                    bdd["level-utilisateurs"][message.member.id] = 1;
                    Savebdd();
                    return message.channel.send(`Bravo ${message.author} tu es passé niveau 1 !`);
                }
            }
            else if (bdd["coins-utilisateurs"][message.member.id] > 250 && bdd["coins-utilisateurs"][message.member.id] < 500) {
                if (bdd["level-utilisateurs"][message.member.id] == 1) {
                    bdd["level-utilisateurs"][message.member.id] = 2;
                    Savebdd();
                    return message.channel.send(`Bravo ${message.author} tu es passé niveau 2 !`);
                }
            }
            else if (bdd["coins-utilisateurs"][message.member.id] > 500 && bdd["coins-utilisateurs"][message.member.id] < 1000) {
                if (bdd["level-utilisateurs"][message.member.id] == 2) {
                    bdd["level-utilisateurs"][message.member.id] = 3;
                    Savebdd();
                    return message.channel.send(`Bravo ${message.author} tu es passé niveau 3 !`);
                }
            }
            else if (bdd["coins-utilisateurs"][message.member.id] > 1000) {
                if (bdd["level-utilisateurs"][message.member.id] == 3) {
                    bdd["level-utilisateurs"][message.member.id] = 4;
                    Savebdd();
                    return message.channel.send(`Bravo ${message.author} tu es passé niveau 4 !`);
                }
            }
        }
    }
     if(message.content.startsWith('!youtube')){
        const data = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCWqPk07TBQAKy695NJMnlZg&key=AIzaSyDWDZMYQwGq5ON1u7s4ZNloxp0U5MRw0zo').then(response => response.json());
        console.log(data)
        const monembed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Youtube')
            .setURL('https://discord.js.org/')
            .setAuthor('Mon Bot discord', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('Voici les statistiques youtube')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields(
                { name: 'Nombre d\'abonnés', value: data.items[0].statistics.subscriberCount, inline: true },
                { name: 'Nombre de vidéos : ', value: data.items[0].statistics.videoCount, inline: true },
                { name: 'Nombre de vues sur la chaîne : ', value: data.items[0].statistics.viewCount, inline: true },
                // { name: 'Nombres de bots sur le serveur : ', value: totalbots, inline: true },
                // { name: 'Nombre d\'arrivants : ', value: totalrole, inline: true },
            )
            .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()
            .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

        message.channel.send(monembed);
    }
    if (message.content.startsWith('!ban')) {
        if (message.member.hasPermission('BAN_MEMBERS')) {

            //!ban @test 1234 test

            let arg = message.content.trim().split(/ +/g)

            utilisateur = message.mentions.members.first();
            temps = arg[2];
            raison = arg[3];

            if (!utilisateur) {
                return message.channel.send('Vous devez mentionner un utilisateur !');
            }
            else {
                if (!temps || isNaN(temps)) {
                    return message.channel.send('Vous devez indiquer un temps en secondes !');
                } else {
                    if (!raison) {
                        return message.channel.send('Vous devez indiquer une raison du ban !');
                    } else {
                        //on effectue le tempban
                        message.guild.members.ban(utilisateur.id);
                        setTimeout(function () {
                            message.guild.members.unban(utilisateur.id);
                        }, temps * 1000);

                    }
                }
            }


        } else {
            return message.channel.send('Tu n\'as pas les permissions nécessaires !');
        }
    }
})

bot.on("messageReactionAdd", (reaction, member) => {
    if (reaction.emoji.name == "✅") {
        reaction.message.channel.send('Tu as réagi : ✅');
        var channel_ticket = reaction.message.guild.channels.create('ticket', {
            type: 'text',
            parent: "699308964575314043",
            permissionOverwrites: [{
                id: reaction.message.guild.id,
                deny: ['SEND_MESSAGES'],
                allow: ['ADD_REACTIONS']
            }]
        }).then(channel_ticket => {
            channel_ticket.send("Channel crée !")
        })
    }
})

bot.on("guildCreate", guild => {
    bdd[guild.id] = {}
    Savebdd()
})

   //Musique
    bot.on("message", async message => {
        if (message.author.bot) return;
        if (!message.content.startsWith("!")) return;

        const serverQueue = queue.get(message.guild.id);
        if (message.content.startsWith(`!play`)) {
          execute(message, serverQueue);
          return;
        } else if (message.content.startsWith(`!skip`)) {
          skip(message, serverQueue);
          return;
        } else if (message.content.startsWith(`!stop`)) {
          stop(message, serverQueue);
          return;
        } else if (message.content.startsWith(`!pause`)) {
          pause(message, serverQueue);
          return;
        } else {
          message.channel.send("You need to enter a valid command!");
        }
      });

function addRandomInt(member) {
    bdd["coins-utilisateurs"][member.id] = bdd["coins-utilisateurs"][member.id] + Math.floor(Math.random() * (4 - 1) + 1);
    Savebdd();
}

function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreur est survenue.");
    });
  }

//Fonctions musique
async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
      title: songInfo.title,
      url: songInfo.video_url
    };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
  
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
  
  function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
  }
  
  function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  function pause(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
      if(serverQueue.connection.dispatcher.paused){
        serverQueue.connection.dispatcher.resume();
      }
      else{
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.pause();
      }
  }
  
  function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }

bot.login('NzM5MjA4ODg1ODk3OTIwNjE0.XyXH7A.NWEdQ8V_f-NA2IOFR1AnWm8u938');
