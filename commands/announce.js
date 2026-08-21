const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const OWNER_ID = '1177274553492308048';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement to a channel')
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to send the announcement to')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('Announcement content')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('title')
        .setDescription('Announcement title (optional)')
        .setRequired(false)
    )
    .addBooleanOption(opt =>
      opt.setName('everyone')
        .setDescription('Ping @everyone (optional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const isOwner = interaction.user.id === OWNER_ID;
    const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);

    if (!isOwner && !isAdmin) {
      return interaction.reply({
        content: '❌ You need Administrator permission or be the bot owner to use this command.',
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const title = interaction.options.getString('title');
    const pingEveryone = interaction.options.getBoolean('everyone') || false;

    const embed = new EmbedBuilder()
      .setDescription(message)
      .setColor(0x010101)
      .setFooter({ text: '#GOKYR' })
      .setTimestamp();

    if (title) embed.setTitle(title);

    await channel.send({
      content: pingEveryone ? '@everyone' : undefined,
      embeds: [embed],
    });

    await interaction.reply({
      content: `✅ Announcement sent to ${channel}.`,
      ephemeral: true,
    });
  },
};
