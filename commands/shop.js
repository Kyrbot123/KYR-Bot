const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Check out the Kyroz Esport shop and links'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Kyroz Esport Shop')
      .setDescription('Check out our official links below:')
      .addFields(
        { name: 'Team Page', value: '[yokoesport.fr](https://yokoesport.fr/equipes/kyroz-esport)' },
        { name: 'NFT Collection', value: '[xrp.cafe](https://xrp.cafe/collection/kyroz)' }
      )
      .setColor(0x010101)
      .setFooter({ text: '#GOKYR' });

    await interaction.reply({ embeds: [embed] });
  },
};
