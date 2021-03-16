const { guildModel } = require("../data/export");
const { MessageEmbed } = require("discord.js");
const fetchAll = require("discord-fetch-all");
const hastebin = require("hastebin.js");
const haste = new hastebin({ url: "https://hastebin.com" });
module.exports = async (client, type, channel, id, guildD) => {
  const user = client.users.cache.get(id);
  const guildDoc = await guildModel.findOne({
    Guild: guildD,
  });
  if (!guildDoc.log) return;
  const embed = new MessageEmbed()
    .setTitle("Ticket logs!")
    .setDescription(
      `The ticket ${channel.name} has been ${type} (Owner: ${user.tag})`
    )
    .setFooter("Ticket logs | made by tovade")
    .setTimestamp();
  if (type === "deleted") {
    const msgsArray = await fetchAll.messages(channel, {
      reverseArray: true,
    });
    const content = msgsArray.map(
      (m) =>
        `${m.author.tag} - ${
          m.embeds.length ? m.embeds[0].description : m.content
        }`
    );
    haste
      .post(content.join("\n"), "js")
      .then((url) => embed.addField("Transcript:", url));
  }
  client.channels.cache.get(guildDoc.log).send(embed);
};
