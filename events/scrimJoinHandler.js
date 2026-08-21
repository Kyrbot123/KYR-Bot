const { Events } = require('discord.js');
const db = require('../utils/firebase');
const { buildScrimEmbed } = require('../utils/scrimEmbed');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('scrim_join_') && !interaction.customId.startsWith('scrim_leave_')) return;

    const isJoin = interaction.customId.startsWith('scrim_join_');
    const scrimId = interaction.customId.replace(isJoin ? 'scrim_join_' : 'scrim_leave_', '');

    const scrimRef = db.collection('kyrbot_scrims').doc(scrimId);
    const doc = await scrimRef.get();

    if (!doc.exists) {
      return interaction.reply({ content: '❌ This scrim no longer exists.', ephemeral: true });
    }

    const scrim = doc.data();

    if (scrim.status === 'cancelled' || scrim.status === 'done') {
      return interaction.reply({ content: '❌ This scrim is no longer open.', ephemeral: true });
    }

    let players = [...scrim.players];

    if (isJoin) {
      if (players.includes(interaction.user.id)) {
        return interaction.reply({ content: 'You are already signed up.', ephemeral: true });
      }
      if (players.length >= scrim.maxPlaces) {
        return interaction.reply({ content: '❌ This scrim is full.', ephemeral: true });
      }
      players.push(interaction.user.id);
    } else {
      if (!players.includes(interaction.user.id)) {
        return interaction.reply({ content: 'You are not signed up for this scrim.', ephemeral: true });
      }
      players = players.filter(id => id !== interaction.user.id);
    }

    const newStatus = players.length >= scrim.maxPlaces ? 'full' : 'open';

    await scrimRef.update({ players, status: newStatus });

    const updatedScrim = { ...scrim, players, status: newStatus };

    await interaction.update({ embeds: [buildScrimEmbed(updatedScrim, scrimId)] });
  },
};
