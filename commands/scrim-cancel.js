const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/firebase');
const { buildScrimEmbed } = require('../utils/scrimEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scrim-cancel')
    .setDescription('Cancel a scrim')
    .addStringOption(opt =>
      opt.setName('id').setDescription('Scrim ID (from /scrim-list)').setRequired(true)
    ),

  async execute(interaction) {
    const scrimId = interaction.options.getString('id');
    const scrimRef = db.collection('kyrbot_scrims').doc(scrimId);
    const doc = await scrimRef.get();

    if (!doc.exists) {
      return interaction.reply({ content: '❌ Scrim not found.', ephemeral: true });
    }

    const scrim = doc.data();
    const isOrganizer = scrim.organizerId === interaction.user.id;
    const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);

    if (!isOrganizer && !isAdmin) {
      return interaction.reply({ content: '❌ Only the organizer or an admin can cancel this scrim.', ephemeral: true });
    }

    await scrimRef.update({ status: 'cancelled' });

    try {
      const channel = await interaction.guild.channels.fetch(scrim.channelId);
      const message = await channel.messages.fetch(scrim.messageId);
      const updatedScrim = { ...scrim, status: 'cancelled' };
      await message.edit({ embeds: [buildScrimEmbed(updatedScrim, scrimId)], components: [] });
    } catch (err) {
      console.error('Could not update scrim message:', err.message);
    }

    await interaction.reply({ content: '✅ Scrim cancelled.', ephemeral: true });
  },
};
