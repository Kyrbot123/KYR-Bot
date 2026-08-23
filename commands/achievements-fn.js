const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OWNER_ID = '1177274553492308048';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements-fn')
    .setDescription('Send the Fortnite roster achievements panel to this channel'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ This command is reserved to the bot owner.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('<:fortnitelogo:1536630758632980550> Fortnite — Roster EMEA')
      .setDescription(
        "**Grand Finals:**\n<:fncs:1536629611927052349> x3 (Top 10 and 15)\n\n" +
        "**Heats:**\n<:emoji_67:1537544877267488839> x5\n\n" +
        "**Victory Cup:**\n<:emoji_72:1537607719161176075> x1 Finals Duo (Top 1 x2)\n\n" +
        "**Last Chance Qualifier (LCQ):**\n<:fncs:1536629611927052349> x2 Finals\n\n" +
        "**Evaluation Cup:**\n<:emoji_74:1537607635447062589> x6 Solo cups\n\n" +
        "**Power Ranking:**\n<:emoji_73:1537607509521465444> +185 000 PR\n\n" +
        "**Division:**\n<:fncs:1536629611927052349> Division 1 cup Finals (Top 3 and 5)\n\n" +
        "**Earnings:**\n💵 5 000€"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage('https://i.imgur.com/1fZHpV7.png');

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Panel sent.', ephemeral: true });
  },
};
