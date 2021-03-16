const createTicket = require("../util/ticket");
const { guildModel } = require("../data/export");
module.exports = {
  name: "new",
  description: "Make a ticket channel!",
  cooldown: 3,
  async execute(message, args) {
    const guildDoc = await guildModel.findOne({ Guild: message.guild.id });
    const e = message.member;
    const user = await message.guild.members.cache.get(e.id);
    if (!args.length) return message.reply("Please provide a reason.");
    await createTicket(message, user, guildDoc, args.join(" "));
  },
};
