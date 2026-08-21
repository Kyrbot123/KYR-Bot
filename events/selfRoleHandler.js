const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('selfrole_')) return;

    const roleId = interaction.customId.replace('selfrole_', '');
    const member = interaction.member;

    try {
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(roleId);
        return interaction.reply({ content: `✅ Role <@&${roleId}> removed.`, ephemeral: true });
      } else {
        await member.roles.add(roleId);
        return interaction.reply({ content: `✅ Role <@&${roleId}> added.`, ephemeral: true });
      }
    } catch (err) {
      console.error('Self-role toggle failed:', err.message);
      return interaction.reply({ content: '❌ Could not update your roles. Check bot role position/permissions.', ephemeral: true });
    }
  },
};
