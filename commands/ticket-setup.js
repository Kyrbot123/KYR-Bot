const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../utils/firebase');
const { BANNER_URL } = require('../utils/branding');

const DEFAULT_REASONS = [
  { id: 'general', label: 'General question', emoji: '❓' },
  { id: 'bug', label: 'Report a bug', emoji: '🐛' },
  { id: 'partnership', label: 'Partnership', emoji: '🤝' },
  { id: 'report', label: 'Report a member', emoji: '🚨' },
  { id: 'other', label: 'Other', emoji: '📝' },
];

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

    const embed = new EmbedBuilder()
      .setTitle("KYROZ'S SUPPORT 🎭")
      .setDescription(
        "**Version française**\n" +
        "> Les tickets non sérieux (trolls) sont strictement interdits. Tout abus du système de tickets pourra entraîner de lourdes sanctions. Sans réponse de votre part sous 24 heures, votre ticket sera automatiquement supprimé.\n\n" +
        "»» L'équipe Staff\n\n" +
        "**English Version**\n" +
        "> Non-serious tickets (trolls) are strictly prohibited. Any abuse of the ticketing system may result in severe penalties. If there is no response from you within 24 hours, your ticket will be automatically deleted.\n\n" +
        "»» The Staff Team"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage(BANNER_URL)
      .setFooter({ text: '#GOKYR' });

    const snapshot = await db.collection('kyrbot_ticket_reasons').doc(interaction.guild.id).collection('reasons').get();
    const reasons = snapshot.empty
      ? DEFAULT_REASONS
      : snapshot.docs.map(doc => ({ id: doc.id, label: doc.data().label, emoji: doc.data().emoji || '📝' }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket_reason')
        .setPlaceholder('Take an option')
        .addOptions(reasons.map(r => ({ label: r.label, value: r.id, emoji: r.emoji })))
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({
      content: `✅ Ticket panel sent to ${channel} — tickets will be created in ${category}.`,
      ephemeral: true,
    });
  },
};
