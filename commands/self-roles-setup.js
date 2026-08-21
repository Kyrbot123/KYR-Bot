const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('self-roles-setup')
    .setDescription('[Admin] Manage self-assignable roles')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a self-role option')
        .addRoleOption(opt => opt.setName('role').setDescription('Role to assign').setRequired(true))
        .addStringOption(opt => opt.setName('label').setDescription('Button label').setRequired(true))
        .addStringOption(opt => opt.setName('emoji').setDescription('Button emoji').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Remove a self-role option')
        .addRoleOption(opt => opt.setName('role').setDescription('Role to remove').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all self-role options')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const ref = db.collection('kyrbot_self_roles').doc(interaction.guild.id).collection('roles');

    if (sub === 'add') {
      const role = interaction.options.getRole('role');
      const label = interaction.options.getString('label');
      const emoji = interaction.options.getString('emoji') || '🔔';

      await ref.doc(role.id).set({ label, emoji, roleId: role.id });

      return interaction.reply({ content: `✅ Self-role added: ${emoji} **${label}** → ${role}`, ephemeral: true });
    }

    if (sub === 'remove') {
      const role = interaction.options.getRole('role');
      await ref.doc(role.id).delete();
      return interaction.reply({ content: `✅ Self-role removed: ${role}`, ephemeral: true });
    }

    if (sub === 'list') {
      const snapshot = await ref.get();
      if (snapshot.empty) {
        return interaction.reply({ content: 'No self-roles configured yet.', ephemeral: true });
      }
      const list = snapshot.docs.map(doc => {
        const d = doc.data();
        return `${d.emoji} **${d.label}** — <@&${d.roleId}>`;
      }).join('\n');
      return interaction.reply({ content: `**Self-roles:**\n${list}`, ephemeral: true });
    }
  },
};
