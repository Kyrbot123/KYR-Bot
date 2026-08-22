const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules-setup')
    .setDescription('[Admin] Set the role given when a member accepts the rules')
    .addRoleOption(opt => opt.setName('role').setDescription('Role to give on accept').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    await db.collection('kyrbot_config').doc(`rules_${interaction.guild.id}`).set({
      roleId: role.id,
    });

    await interaction.reply({ content: `✅ Members who accept the rules will now receive the ${role} role.`, ephemeral: true });
  },
};
