const { Events, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/firebase');
const { ensureRankRoles } = require('../utils/ranks');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('rankverify_')) return;

    // customId format: rankverify_<RankName>_<userId>
    const parts = interaction.customId.split('_');
    const rankName = parts[1];
    const targetUserId = parts[2];

    const configDoc = await db.collection('kyrbot_config').doc(`rank_verify_${interaction.guild.id}`).get();
    if (!configDoc.exists) {
      return interaction.reply({ content: '❌ Rank verification is not configured.', ephemeral: true });
    }

    const { staffRoleId } = configDoc.data();
    const member = await interaction.guild.members.fetch(interaction.user.id);

    if (!member.roles.cache.has(staffRoleId) && !member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ You are not allowed to verify ranks.', ephemeral: true });
    }

    await interaction.deferUpdate();

    const roles = await ensureRankRoles(interaction.guild);
    const targetMember = await interaction.guild.members.fetch(targetUserId).catch(() => null);

    if (!targetMember) {
      return interaction.followUp({ content: '❌ Could not find that member anymore.', ephemeral: true });
    }

    // Remove any previous rank role, then add the new one
    const rankRoleIds = Object.values(roles).map(r => r.id);
    const rolesToRemove = targetMember.roles.cache.filter(r => rankRoleIds.includes(r.id));
    if (rolesToRemove.size > 0) {
      await targetMember.roles.remove(rolesToRemove);
    }
    await targetMember.roles.add(roles[rankName]);

    await db.collection('kyrbot_rank_verifications').doc(interaction.channel.id).update({
      status: 'verified',
      rank: rankName,
      verifiedBy: interaction.user.id,
      verifiedAt: new Date().toISOString(),
    }).catch(() => {});

    await interaction.followUp({
      content: `✅ ${targetMember} has been verified as **${rankName}**. This ticket will close in 5 seconds.`,
    });

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  },
};
