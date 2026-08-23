const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const OWNER_ID = '1177274553492308048';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('achievements-bs-emea')
    .setDescription('Send the Brawl Stars EMEA roster achievements panel to this channel'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ This command is reserved to the bot owner.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎮 Brawl Stars — Roster EMEA')
      .setDescription(
        "**Tournament:**\n<:matcherinopins:1494642227266195536> Matcherino Pin\n\n" +
        "**Earnings:**\n💵 350€"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage('https://i.imgur.com/kLwV61R.png');

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Panel sent.', ephemeral: true });
  },
};
