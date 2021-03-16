const { MessageEmbed } = require("discord.js"),
  { guildModel } = require("../data/export");
module.exports = {
  name: "ping",
  description: "Get my ping!",
  cooldown: 10,
  execute(message) {
    message.channel.send("Testing ping...").then(async (m) => {
      let randomColor = "RED";
      let dataPing = Date.now();
      await guildModel.findOne({});
      let dataPingNow = Date.now();
      let dataRealPing = dataPingNow - dataPing;
      const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setTitle("🏓 Pong!")
        .setDescription(
          `Bot Evaluation Time - **${Math.round(
            (m.createdAt - message.createdAt) / client.ws.ping
          )}**ms \nBot Latency - **${Math.round(
            m.createdAt - message.createdAt
          )}**ms \nAPI Latency - **${Math.round(
            message.client.ws.ping
          )}**ms\nDatabase Latency - **${dataRealPing}**ms`
        )
        .setColor("RED");
      m.edit(embed);
    });
  },
};
