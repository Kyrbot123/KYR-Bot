const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { BANNER_URL } = require('../utils/branding');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('faq')
    .setDescription('[Admin] Send the Kyroz FAQ to a channel')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send the FAQ to').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setTitle('F.A.Q.')
      .setDescription(
        "**What's this server about?**\n" +
        "• Kyroz's Discord server is the official hub for our community. - Stay up to date with announcements, tournaments, roster updates, and exclusive content.\n" +
        "• Meet other players, take part in events, and grow with the community.\n\n" +
        "**Where can I get help?**\n" +
        "• If you need assistance with anything related to the server, simply open a ticket in #🎫 | Support.\n" +
        "• A staff member will assist you as soon as possible.\n\n" +
        "**How do I claim my Tier?**\n" +
        "• Open a ticket in #🎫 | Support. - Include screenshots of your result and the name of the tournament you played.\n" +
        "• Tier Criteria is here: #inconnu.\n\n" +
        "**How can I join the Academy?**\n" +
        "• The Academy is here: #⚔️ | KTC.\n" +
        "• Open a ticket in #🎫 | Support to apply for the Kyroz Academy.\n" +
        "• Our staff will review your application.\n\n" +
        "**How do I earn XP?**\n" +
        "• You earn XP simply by being active and chatting in the server's text channels.\n\n" +
        "**Will there be giveaways or events?**\n" +
        "• Giveaways are hosted in #🎁 | Giveaways\n" +
        "• Tournaments are announced in 📣📢 | Tournament-Updates...\n" +
        "• Check upcoming tournaments in #📋 | Tournament-Schedules...\n" +
        "• Customize your notifications in #🛠️ | Self-roles\n\n" +
        "**How can I join a roster?**\n" +
        "• Recruitment opportunities are announced when roster spots become available.\n" +
        "• Follow our announcements and application channels for updates.\n\n" +
        "**Where can I find our partners and sponsors?**\n" +
        "• Visit #🏆 | Partners to discover Kyroz's official partners and sponsors.\n\n" +
        "**Where can I find our social media?**\n" +
        "• All of our official social media accounts are available in #🌐 | Socials.\n\n" +
        "**What happens if I break the rules?**\n" +
        "• Violating the server rules may result in warnings, mutes, kicks, or permanent bans depending on the severity of the offense.\n" +
        "• Make sure to read #📋 | Rules before participating.\n\n" +
        "Enjoy your stay and welcome to Kyroz!"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage(BANNER_URL);

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ FAQ sent to ${channel}.`, ephemeral: true });
  },
};
