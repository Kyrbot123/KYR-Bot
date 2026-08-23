const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OWNER_ID = '1177274553492308048';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements-bs-na')
    .setDescription('Send the Brawl Stars NA roster achievements panel to this channel'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ This command is reserved to the bot owner.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('<:brawlstartlogo:1536631350428172338> Brawl Stars — Roster NA')
      .setDescription(
        "**Region:**\n🌎 Top 15 North America\n\n" +
        "**Tournament:**\n<:matcherinopins:1494642227266195536> Matcherino Pin\n<:emoji_73:1537560149001117776> Winner Challenger North America\n\n" +
        "**Monthly Qualifier (MQ):**\n<:emoji_73:1537560090473799743> x6 BSC MQ Day 2\n\n" +
        "**Earnings:**\n💸 6 000$"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage('https://i.imgur.com/6v5eEzT.png');

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Panel sent.', ephemeral: true });
  },
};
