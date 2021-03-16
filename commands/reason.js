const { ticketModel } = require("../data/export");
module.exports = {
  name: "reason",
  description: "Change the topic of the ticket!",
  async execute(message, args) {
    const model = await ticketModel.findOne({
      guild: message.guild.id,
      channelID: message.channel.id,
    });
    if (!model) return message.reply("This is not an ticket.");
    const reason = args.join(" ");
    if (!reason) return message.reply("You forgot to give an reason!");

    await model.updateOne({ reason: reason });
    await message.channel.setTopic(`**Reason:** ${reason}`);
    message.channel.send("Changed the ticket topic!");
  },
};
