const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank-verify-setup')
    .setDescription('[Admin] Set the staff role that can verify player ranks')
    .addRoleOption(opt =>
      opt.setName('role')
        .setDescription('Staff/Moderator role allowed to verify ranks')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    await db.collection('kyrbot_config').doc(`rank_verify_${interaction.guild.id}`).set({
      staffRoleId: role.id,
      guildId: interaction.guild.id,
      updatedAt: new Date().toISOString(),
    });

    await interaction.reply({
      content: `✅ Staff role for rank verification set to ${role}.`,
      ephemeral: true,
    });
  },
};
