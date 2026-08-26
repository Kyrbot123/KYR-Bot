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
        "• Kyroz's Discord server is the official hub for our community.\n" +
        "• Stay up to date with announcements, tournaments, roster updates, and exclusive content.\n" +
        "• Meet other players, take part in events, and grow with the community.\n\n" +
        "**Where can I get help?**\n" +
        "• If you need assistance with anything related to the server, simply open a ticket in <#1494432430382387201>.\n" +
        "• A staff member will assist you as soon as possible.\n\n" +
        "**Where can I find Kyroz's rosters?**\n" +
        "• Visit <#1523563817995472896> to discover all our current competitive rosters.\n" +
        "• You can find our teams across the different games in which Kyroz competes.\n\n" +
        "**Where can I find Kyroz merch?**\n" +
        "• Visit <#1494432400241852476> to discover our official Kyroz merchandise.\n" +
        "• New products and collections will also be announced there.\n\n" +
        "**How do I claim my Tier?**\n" +
        "• Open a ticket in <#1494432430382387201>.\n" +
        "• Include screenshots of your result and the name of the tournament you played.\n" +
        "• Tier Criteria can be found in the dedicated Tier Criteria channel.\n\n" +
        "**How can I join the Academy?**\n" +
        "• The Academy can be found in <#1514710801603231876>.\n" +
        "• Open a ticket in <#1494432430382387201> to apply for the Kyroz Academy.\n" +
        "• Our staff will review your application.\n\n" +
        "**How do I earn XP?**\n" +
        "• You earn XP simply by being active and chatting in the server's text channels.\n\n" +
        "**Will there be giveaways or events?**\n" +
        "• Giveaways are hosted in <#1494432411319140402>.\n" +
        "• Tournaments are announced in Tournament Updates.\n" +
        "• Check upcoming competitions in Tournament Schedules.\n" +
        "• Customize your notifications in <#1494432395443572756>.\n\n" +
        "**How can I join a roster?**\n" +
        "• Recruitment opportunities are announced whenever roster spots become available.\n" +
        "• Follow our announcements and recruitment channels to stay updated.\n\n" +
        "**Where can I find our partners and sponsors?**\n" +
        "• Visit <#1522661520901668914> to discover Kyroz's official partners and sponsors."
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage(BANNER_URL);

    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ FAQ sent to ${channel}.`, ephemeral: true });
  },
};
