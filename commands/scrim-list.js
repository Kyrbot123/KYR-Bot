const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scrim-list')
    .setDescription('List all upcoming scrims'),

  async execute(interaction) {
    const snapshot = await db.collection('kyrbot_scrims')
      .where('guildId', '==', interaction.guild.id)
      .where('status', 'in', ['open', 'full'])
      .get();

    if (snapshot.empty) {
      return interaction.reply({ content: 'No upcoming scrims right now.', ephemeral: true });
    }

    const scrims = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.date - b.date);

    const embed = new EmbedBuilder()
      .setTitle('⚔️ Upcoming Scrims')
      .setColor(0x000000)
      .setFooter({ text: '#GOKYR' });

    for (const scrim of scrims) {
      embed.addFields({
        name: `${scrim.format} — <t:${scrim.date}:F>`,
        value: `Organizer: <@${scrim.organizerId}>\nPlayers: ${scrim.players.length}/${scrim.maxPlaces}\nID: \`${scrim.id}\``,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
