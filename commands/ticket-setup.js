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
  { id: 'staff', label: 'To be staff', emoji: '<:kyroz:1535345305783115826>' },
  { id: 'matcherino', label: 'Matcherino (Only for the tournament)', emoji: '<:matcherinopins:1494642227266195536>' },
  { id: 'tier', label: 'Claim my tier', emoji: '<:TierS:1505828261018472529>' },
  { id: 'training', label: 'Join our training center', emoji: '<:good:1494642260002996225>' },
  { id: 'report', label: 'Factual report or problem', emoji: '<:bad:1494642291036389446>' },
  { id: 'club', label: 'Join one of our clubs', emoji: '<:bslogo:1508061127832240158>' },
  { id: 'collab', label: 'Collaboration', emoji: '<:0developer:1533928944116432956>' },
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
    .addRoleOption(option =>
      option.setName('staff_role')
        .setDescription('Staff role to ping when a ticket is opened')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('admin_role')
        .setDescription('Admin role to ping when a ticket is opened')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const category = interaction.options.getChannel('category');
    const staffRole = interaction.options.getRole('staff_role');
    const adminRole = interaction.options.getRole('admin_role');

    await db.collection('kyrbot_ticket_config').doc(interaction.guild.id).set({
      categoryId: category.id,
      staffRoleId: staffRole.id,
      adminRoleId: adminRole.id,
      guildId: interaction.guild.id,
      updatedAt: new Date().toISOString(),
    });

    const embed = new EmbedBuilder()
      .setTitle("<:kyroldemojis:1494698723882700821> KYROZ'S SUPPORT")
      .setDescription(
        "**Version française**\n" +
        "> Les tickets non sérieux (trolls) sont strictement interdits. Tout abus du système de tickets pourra entraîner de lourdes sanctions. Sans réponse de votre part sous 24 heures, votre ticket sera automatiquement supprimé.\n\n" +
        "<a:blue_arrow:1533913545568157696> L'équipe Staff\n\n" +
        "**English Version**\n" +
        "> Non-serious tickets (trolls) are strictly prohibited. Any abuse of the ticketing system may result in severe penalties. If there is no response from you within 24 hours, your ticket will be automatically deleted.\n\n" +
        "<a:blue_arrow:1533913545568157696> The Staff Team"
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
