const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules-setup')
    .setDescription('[Admin] Set the verified role and lock the server behind it')
    .addRoleOption(opt => opt.setName('role').setDescription('Role to give on accept').setRequired(true))
    .addChannelOption(opt => opt.setName('rules_channel').setDescription('Channel where the rules are posted (stays visible to everyone)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const rulesChannel = interaction.options.getChannel('rules_channel');

    await db.collection('kyrbot_config').doc(`rules_${interaction.guild.id}`).set({
      roleId: role.id,
    });

    await interaction.deferReply({ ephemeral: true });

    const everyone = interaction.guild.roles.everyone;
    let updated = 0;
    let failed = 0;

    const channels = interaction.guild.channels.cache.filter(c =>
      c.type === ChannelType.GuildText ||
      c.type === ChannelType.GuildVoice ||
      c.type === ChannelType.GuildCategory ||
      c.type === ChannelType.GuildAnnouncement ||
      c.type === ChannelType.GuildForum
    );

    for (const channel of channels.values()) {
      if (channel.id === rulesChannel.id) continue;

      try {
        await channel.permissionOverwrites.edit(everyone, { ViewChannel: false });
        await channel.permissionOverwrites.edit(role, { ViewChannel: true });
        updated++;
      } catch (error) {
        console.error(`Failed to update permissions for ${channel.name}:`, error.message);
        failed++;
      }
    }

    // Make sure the rules channel itself stays visible to everyone
    try {
      await rulesChannel.permissionOverwrites.edit(everyone, { ViewChannel: true, SendMessages: false });
    } catch (error) {
      console.error('Failed to set rules channel permissions:', error.message);
    }

    await interaction.editReply({
      content: `✅ Members who accept the rules will now receive the ${role} role.\n🔒 ${updated} channel(s) locked behind that role${failed > 0 ? ` (${failed} failed — check my role position and permissions)` : ''}.\n📋 ${rulesChannel} stays visible to everyone.`,
    });
  },
};
