const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const OWNER_ID = '1177274553492308048';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop-panel')
    .setDescription('Send the official Kyroz merch shop panel to this channel'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ This command is reserved to the bot owner.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('KYROZ OFFICIAL SHOP')
      .setDescription(
        "**Welcome to the official Kyroz Esport Shop.**\n\n" +
        "This is where our community can discover and purchase **Kyroz merchandise**, designed around our identity and competitive vision.\n\n" +
        "New products and exclusive releases **will regularly be added to the shop as Kyroz continues to grow.**\n\n" +
        "By purchasing our merchandise, **you directly support the organization, our players, and our future projects.**\n\n" +
        "Shop Now\n\n" +
        "**Represent Kyroz. Be part of the journey.**\n**#GOKYR**"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage('https://i.imgur.com/By607s0.png');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Buy jersey now')
        .setStyle(ButtonStyle.Link)
        .setURL('https://yokoesport.fr/equipes/kyroz-esport'),
      new ButtonBuilder()
        .setLabel('Buy our cards now')
        .setStyle(ButtonStyle.Link)
        .setURL('https://xrp.cafe/collection/kyroz')
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Panel sent.', ephemeral: true });
  },
};
