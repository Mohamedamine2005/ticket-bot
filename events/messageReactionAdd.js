const createTicket = require("../util/ticket");
const { panelModel, guildModel, ticketModel } = require("../data/export");
const { MessageEmbed, MessageAttachment } = require("discord.js");
const fetchAll = require("discord-fetch-all");
const fs = require("fs");
const hastebin = require("hastebin.js");
const haste = new hastebin({ url: "https://hastebin.com" });
const { reactions } = require("discord-fetch-all");
module.exports = async (client, reaction, user) => {
  const { message } = reaction;
  if (user.bot) return;
  if (user.partial) await user.fetch();
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
  const panelDoc = await panelModel.findOne({
    guild: reaction.message.guild.id,
  });
  const guildDoc = await guildModel.findOne({
    Guild: reaction.message.guild.id,
  });
  const ticketDoc = await ticketModel.findOne({
    guild: reaction.message.guild.id,
    channelID: message.channel.id,
  });

  if (reaction.message.id === panelDoc.msg) {
    reaction.users.remove(user);
    createTicket(message, user, guildDoc);
  }

  if (reaction.message.id === ticketDoc.msg && reaction.emoji.name === "š") {
    reaction.users.remove(user);
    message.channel.updateOverwrite(client.users.cache.get(ticketDoc.owner), {
      SEND_MESSAGES: false,
      VIEW_CHANNEL: false,
    });
    await client.emit(
      "ticketLog",
      "closed",
      message.channel,
      ticketDoc.userID,
      message.guild.id
    );
    const msg = await message.channel.send({
      embed: {
        color: "RED",
        description: "š Reopen Ticket \nā Close Ticket \nš° Transcript!",
      },
    });
    await msg.react("š");
    await msg.react("ā");
    await msg.react("š°");
    ticketDoc.msg = msg.id;
    ticketDoc.status = false;

    await ticketDoc.save();
  } else if (
    reaction.message.id === ticketDoc.msg &&
    reaction.emoji.name === "š"
  ) {
    message.channel.updateOverwrite(client.users.cache.get(ticketDoc.userID), {
      SEND_MESSAGES: true,
      VIEW_CHANNEL: true,
    });
    await client.emit(
      "ticketLog",
      "re-opened",
      message.channel,
      ticketDoc.userID,
      message.guild.id
    );

    const msg = await message.channel.messages.fetch(ticketDoc.msg);

    msg.delete();
    const e = new MessageEmbed().setDescription(
      "Staff re-opened this ticket. You can react with š to close this ticket again!"
    );
    const owner = await message.guild.members.cache.get(ticketDoc.owner);
    const msg3 = await message.channel.send(e);
    ticketDoc.msg = msg3.id;
    ticketDoc.ticketStatus = true;

    await ticketDoc.save();
    await msg3.react("š");

    message.channel.send({
      embed: {
        color: "GREEN",
        description: `Ticket opened by ${user}`,
      },
    });
  } else if (
    reaction.message.id === ticketDoc.msg &&
    reaction.emoji.name == "ā"
  ) {
    message.channel.delete();
    await client.emit(
      "ticketLog",
      "deleted",
      message.channel,
      ticketDoc.userID,
      message.guild.id
    );
    await ticketDoc.deleteOne();
  } else if (
    reaction.message.id === ticketDoc.msg &&
    reaction.emoji.name == "š°"
  ) {
    const msgsArray = await fetchAll.messages(message.channel, {
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
      .then((url) => message.channel.send(url));
  }
};
