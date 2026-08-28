const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const PING_ROLE_ID = '1494454160270032977';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('instagram-post')
    .setDescription('[Admin] Manually announce a new Instagram post')
    .addStringOption(opt => opt.setName('link').setDescription('Link to the Instagram post').setRequired(true))
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to post the announcement in').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const link = interaction.options.getString('link');
    const channel = interaction.options.getChannel('channel');

    await channel.send(
      `<@&${PING_ROLE_ID}>\n**Kyroz just posted a new Instagram post! ❤️ & ♻️**\n${link}`
    );

    await interaction.reply({ content: `✅ Announcement sent to ${channel}.`, ephemeral: true });
  },
};
