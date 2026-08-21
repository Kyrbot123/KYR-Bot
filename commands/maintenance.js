const { SlashCommandBuilder } = require('discord.js');
const db = require('../utils/firebase');

const OWNER_ID = '1177274553492308048';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('[Owner only] Toggle global maintenance mode')
    .addSubcommand(sub =>
      sub.setName('activer')
        .setDescription('Enable maintenance mode')
        .addIntegerOption(opt =>
          opt.setName('fin')
            .setDescription('End time (unix timestamp, required)')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('debut')
            .setDescription('Start time (unix timestamp, optional)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('raison')
            .setDescription('Reason for maintenance')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('desactiver')
        .setDescription('Disable maintenance mode')
    )
    .addSubcommand(sub =>
      sub.setName('statut')
        .setDescription('Check current maintenance status')
    ),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Only the bot owner can use this command.',
        ephemeral: true,
      });
    }

    const sub = interaction.options.getSubcommand();
    const docRef = db.collection('kyrbot_config').doc('maintenance');

    if (sub === 'activer') {
      const fin = interaction.options.getInteger('fin');
      const debut = interaction.options.getInteger('debut') || Math.floor(Date.now() / 1000);
      const raison = interaction.options.getString('raison') || 'No reason provided';

      await docRef.set({
        active: true,
        start: debut,
        end: fin,
        reason: raison,
        updatedAt: new Date().toISOString(),
      });

      return interaction.reply({
        content: `🛠️ Maintenance mode **enabled**.\nStart: <t:${debut}:F>\nEnd: <t:${fin}:F>\nReason: ${raison}`,
        ephemeral: true,
      });
    }

    if (sub === 'desactiver') {
      await docRef.set({
        active: false,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return interaction.reply({ content: '✅ Maintenance mode **disabled**.', ephemeral: true });
    }

    if (sub === 'statut') {
      const doc = await docRef.get();

      if (!doc.exists || !doc.data().active) {
        return interaction.reply({ content: '✅ Maintenance mode is currently **off**.', ephemeral: true });
      }

      const { start, end, reason } = doc.data();
      return interaction.reply({
        content: `🛠️ Maintenance mode is **on**.\nStart: <t:${start}:F>\nEnd: <t:${end}:F>\nReason: ${reason}`,
        ephemeral: true,
      });
    }
  },
};
