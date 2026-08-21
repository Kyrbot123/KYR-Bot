const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),

  async execute(interaction, client) {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });

    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Roundtrip Latency', value: `${roundtrip}ms`, inline: true },
        { name: 'WebSocket Latency', value: `${wsPing}ms`, inline: true }
      )
      .setColor(0x010101)
      .setFooter({ text: '#GOKYR' });

    await interaction.editReply({ content: null, embeds: [embed] });
  },
};
