const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-setup')
    .setDescription('[Admin] Configure and send the ticket panel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel where the ticket panel will be sent')
        .setRequired(true)
    )
    .addChannelOption(option =>
      option.setName('category')
        .setDescription('Category where new tickets will be created')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const category = interaction.options.getChannel('category');

    await db.collection('kyrbot_ticket_config').doc(interaction.guild.id).set({
      categoryId: category.id,
      guildId: interaction.guild.id,
      updatedAt: new Date().toISOString(),
    });

    const messageConfig = await db.collection('kyrbot_config').doc(`ticket_message_${interaction.guild.id}`).get();
    const panelTitle = messageConfig.exists ? messageConfig.data().title : '🎫 Support Tickets';
    const panelDescription = messageConfig.exists
      ? messageConfig.data().description
      : 'Need help? Click the button below and select a reason to open a ticket.';

    const embed = new EmbedBuilder()
      .setTitle(panelTitle)
      .setDescription(panelDescription)
      .setColor(0x010101)
      .setFooter({ text: '#GOKYR' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel('Open a ticket')
        .setEmoji('🎫')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content: `✅ Ticket panel sent to ${channel} — tickets will be created in ${category}.`,
      ephemeral: true,
    });
  },
};
