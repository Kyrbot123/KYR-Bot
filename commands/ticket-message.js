const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-message')
    .setDescription('[Admin] Customize the ticket panel text')
    .addStringOption(opt => opt.setName('title').setDescription('Panel title').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Panel description').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');

    await db.collection('kyrbot_config').doc(`ticket_message_${interaction.guild.id}`).set({
      title,
      description,
      updatedAt: new Date().toISOString(),
    });

    await interaction.reply({
      content: `✅ Ticket panel text updated. Run /ticket-setup again to apply it.`,
      ephemeral: true,
    });
  },
};
