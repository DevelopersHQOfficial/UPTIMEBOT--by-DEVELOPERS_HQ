const UrlsConfig = require("./../../database/models/UrlsConfig");
const { Client, MessageEmbed, Message } = require("discord.js");
const fetch = require("node-fetch");
const validUrl = require("valid-url");

module.exports = {
  name: "add",
  description: "Adds monitor to your project.",    
  ownerOnly: false,
  run: async (client, message, args) => {
    var url = args[0];

    if (!url) return message.reply({ content: "Please provide a project url" });
    if (!validUrl.isUri(url)) {
      return message.channel.send({ content: "Please provide a vaild url" });
    }
        
    var messageAlert = await message.channel.send({ content: `<@${message.member.user.id}>`, embeds: [new MessageEmbed().setColor("WHITE").setDescription("<a:loading_tranper:885441722958626826>  Please wait...").setFooter(message.member.user.tag).setThumbnail(message.member.user.displayAvatarURL())] });

    var checkIfExsists = await UrlsConfig.findOne({
      projectURL: url,
    });

    if (checkIfExsists === null) {
      
      await UrlsConfig.create({
        authorID: message.author.id,
        projectURL: url,
        pinged: 0,
      }).then(async () => {
        
        client.projects.push(url);
        try {
          
          await fetch(url);
        } catch (e) {
          
          await UrlsConfig.findOneAndUpdate(
            { projectURL: url },
            { error: true, errorText: e.message },
            { new: true }
          );
          message.reply("Fetching Error");
        }
        
        await messageAlert.edit({ embeds: [new MessageEmbed().setTitle("<a:tickwhite:885856951072874566> Added Succesfully").setColor("RED").setDescription("Thanks for using me").setTimestamp()] });
        return message.delete();
      });
    } else {      
      
      await messageAlert.edit({ embeds: [new MessageEmbed().setTitle("🚫 | Already Registered").setDescription("The Project you're Trying To Register Is Already In The Database").setColor("RED").setFoother(message.member.user.tag).setThumbnail(client.user.displayAvatarURL()).setTimestamp()] });
      return message.delete();
    }
  },
};
