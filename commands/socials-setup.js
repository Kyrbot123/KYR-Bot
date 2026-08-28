const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('socials-setup')
    .setDescription('[Admin] Set the channel where new X/Instagram posts are announced')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel for social media announcements').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    await db.collection('kyrbot_config').doc('socials_channel').set({
      channelId: channel.id,
    });

    await interaction.reply({ content: `✅ New X and Instagram posts will now be announced in ${channel}.`, ephemeral: true });
  },
};
