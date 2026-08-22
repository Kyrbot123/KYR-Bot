const {
  Events,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const db = require('../utils/firebase');

const DEFAULT_REASONS = [
  { id: 'staff', label: 'To be staff', emoji: '<:kyroz:1535345305783115826>' },
  { id: 'matcherino', label: 'Matcherino (Only for the tournament)', emoji: '<:matcherinopins:1494642227266195536>' },
  { id: 'tier', label: 'Claim my tier', emoji: '<:TierS:1505828261018472529>' },
  { id: 'training', label: 'Join our training center', emoji: '<:good:1494642260002996225>' },
  { id: 'report', label: 'Factual report or problem', emoji: '<:bad:1494642291036389446>' },
  { id: 'club', label: 'Join one of our clubs', emoji: '<:bslogo:1508061127832240158>' },
  { id: 'collab', label: 'Collaboration', emoji: '<:0developer:1533928944116432956>' },
];

async function getReasons(guildId) {
  const snapshot = await db.collection('kyrbot_ticket_reasons').doc(guildId).collection('reasons').get();

  if (snapshot.empty) {
    return DEFAULT_REASONS;
  }

  return snapshot.docs.map(doc => ({
    id: doc.id,
    label: doc.data().label,
    emoji: doc.data().emoji || '📝',
  }));
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // User selects a reason directly from the panel -> create the ticket channel
    if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_reason') {
      await interaction.deferUpdate();

      const reasonId = interaction.values[0];
      const reasons = await getReasons(interaction.guild.id);
      const reason = reasons.find(r => r.id === reasonId) || { id: reasonId, label: reasonId };

      const configDoc = await db.collection('kyrbot_ticket_config').doc(interaction.guild.id).get();
      if (!configDoc.exists) {
        return interaction.followUp({
          content: '❌ Ticket system is not configured yet. Ask an admin to run /ticket-setup.',
          ephemeral: true,
        });
      }

      const { categoryId } = configDoc.data();

      const ticketChannel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        parent: categoryId,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: interaction.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ],
      });

      // Save ticket to Firebase
      await db.collection('kyrbot_tickets').doc(ticketChannel.id).set({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
        reason: reason.id,
        status: 'open',
        createdAt: new Date().toISOString(),
      });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket — ${reason.label}`)
        .setDescription(`Hello ${interaction.user}, thanks for reaching out. Our team will assist you shortly.`)
        .setColor(0x000000)
        .setFooter({ text: '#GOKYR' });

      const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close ticket')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ content: `${interaction.user}`, embeds: [embed], components: [closeRow] });

      return interaction.followUp({
        content: `✅ Your ticket has been created: ${ticketChannel}`,
        ephemeral: true,
      });
    }

    // Step 3: close ticket
    if (interaction.isButton() && interaction.customId === 'close_ticket') {
      await interaction.reply('🔒 This ticket will be closed in 5 seconds...');

      await db.collection('kyrbot_tickets').doc(interaction.channel.id).update({
        status: 'closed',
        closedAt: new Date().toISOString(),
      }).catch(() => {});

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 5000);
    }
  },
};
