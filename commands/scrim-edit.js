const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/firebase');
const { buildScrimEmbed } = require('../utils/scrimEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scrim-edit')
    .setDescription('Edit an existing scrim')
    .addStringOption(opt =>
      opt.setName('id').setDescription('Scrim ID (from /scrim-list)').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('format').setDescription('New format').setRequired(false)
    )
    .addIntegerOption(opt =>
      opt.setName('slots').setDescription('New max slots').setRequired(false)
    )
    .addIntegerOption(opt =>
      opt.setName('date').setDescription('New date (unix timestamp)').setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('description').setDescription('New description').setRequired(false)
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
      return interaction.reply({ content: '❌ Only the organizer or an admin can edit this scrim.', ephemeral: true });
    }

    if (scrim.status !== 'open' && scrim.status !== 'full') {
      return interaction.reply({ content: '❌ This scrim cannot be edited anymore.', ephemeral: true });
    }

    const updates = {};
    const format = interaction.options.getString('format');
    const slots = interaction.options.getInteger('slots');
    const date = interaction.options.getInteger('date');
    const description = interaction.options.getString('description');

    if (format) updates.format = format;
    if (slots) updates.maxPlaces = slots;
    if (date) updates.date = date;
    if (description) updates.description = description;

    if (Object.keys(updates).length === 0) {
      return interaction.reply({ content: '❌ Provide at least one field to update.', ephemeral: true });
    }

    await scrimRef.update(updates);
    const updatedScrim = { ...scrim, ...updates };

    try {
      const channel = await interaction.guild.channels.fetch(scrim.channelId);
      const message = await channel.messages.fetch(scrim.messageId);
      await message.edit({ embeds: [buildScrimEmbed(updatedScrim, scrimId)] });
    } catch (err) {
      console.error('Could not update scrim message:', err.message);
    }

    await interaction.reply({ content: '✅ Scrim updated.', ephemeral: true });
  },
};
