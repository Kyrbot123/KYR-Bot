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
        "• If you need assistance with anything related to the server, simply open a ticket in <#1494432430382387201>.\n" +
        "• A staff member will assist you as soon as possible.\n\n" +
        "**How do I claim my Tier?**\n" +
        "• Open a ticket in <#1494432430382387201>. - Include screenshots of your result and the name of the tournament you played.\n\n" +
        "**How can I join the Academy?**\n" +
        "• The Academy is here: <#1514710801603231876>.\n" +
        "• Open a ticket in <#1494432430382387201> to apply for the Kyroz Academy.\n" +
        "• Our staff will review your application.\n\n" +
        "**How do I earn XP?**\n" +
        "• You earn XP simply by being active and chatting in the server's text channels.\n\n" +
        "**Will there be giveaways or events?**\n" +
        "• Giveaways are hosted in <#1494432411319140402>\n" +
        "• Tournaments are announced in <#1494589078102872084>\n" +
        "• Check upcoming tournaments in <#1494589511022284993>\n" +
        "• Customize your notifications in <#1494432395443572756>\n\n" +
        "**How can I join a roster?**\n" +
        "• Recruitment opportunities are announced when roster spots become available.\n" +
        "• Follow our announcements and application channels for updates.\n\n" +
        "**Where can I find our partners and sponsors?**\n" +
        "• Visit <#1522661520901668914> to discover Kyroz's official partners and sponsors.\n\n" +
        "**Where can I find our social media?**\n" +
        "• All of our official social media accounts are available in <#1494432401676439773>.\n\n" +
        "**What happens if I break the rules?**\n" +
        "• Violating the server rules may result in warnings, mutes, kicks, or permanent bans depending on the severity of the offense.\n" +
        "• Make sure to read <#1494432393145356483> before participating.\n\n" +
        "Enjoy your stay and welcome to Kyroz!"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage(BANNER_URL);

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ FAQ sent to ${channel}.`, ephemeral: true });
  },
};
