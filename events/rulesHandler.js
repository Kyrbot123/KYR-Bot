const db = require('../utils/firebase');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'accept_rules') return;

    const configDoc = await db.collection('kyrbot_config').doc(`rules_${interaction.guild.id}`).get();

    if (!configDoc.exists || !configDoc.data().roleId) {
      return interaction.reply({ content: '❌ No verified role has been configured yet. An admin must run /rules-setup first.', ephemeral: true });
    }

    const roleId = configDoc.data().roleId;
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
      return interaction.reply({ content: '❌ The configured role no longer exists. Please ask an admin to run /rules-setup again.', ephemeral: true });
    }

    if (interaction.member.roles.cache.has(roleId)) {
      return interaction.reply({ content: '✅ You have already accepted the rules.', ephemeral: true });
    }

    try {
      await interaction.member.roles.add(role);
      await interaction.reply({ content: '✅ Rules accepted! You now have access to the full server. Welcome to Kyroz!', ephemeral: true });
    } catch (error) {
      console.error('Error assigning rules role:', error.message);
      await interaction.reply({ content: '❌ I could not give you the role. Please make sure my role is positioned above it, or contact an admin.', ephemeral: true });
    }
  },
};
