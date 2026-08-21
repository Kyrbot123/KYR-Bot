const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const db = require('../utils/firebase');
const { RANKS, ensureRankRoles } = require('../utils/ranks');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank-verify')
    .setDescription('Verify your rank by submitting a screenshot')
    .addAttachmentOption(opt =>
      opt.setName('screenshot')
        .setDescription('Screenshot of your in-game rank')
        .setRequired(true)
    ),

  async execute(interaction) {
    const screenshot = interaction.options.getAttachment('screenshot');

    if (!screenshot.contentType || !screenshot.contentType.startsWith('image/')) {
      return interaction.reply({ content: '❌ Please attach a valid image file.', ephemeral: true });
    }

    const configDoc = await db.collection('kyrbot_config').doc(`rank_verify_${interaction.guild.id}`).get();
    if (!configDoc.exists) {
      return interaction.reply({
        content: '❌ Rank verification is not configured yet. Ask an admin to run /rank-verify-setup.',
        ephemeral: true,
      });
    }

    const { staffRoleId } = configDoc.data();

    await interaction.deferReply({ ephemeral: true });

    // Make sure the 8 rank roles exist
    await ensureRankRoles(interaction.guild);

    // Create private ticket channel
    const ticketChannel = await interaction.guild.channels.create({
      name: `rank-${interaction.user.username}`,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
        },
        {
          id: staffRoleId,
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
            PermissionFlagsBits.ManageRoles,
          ],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle('🏆 Rank Verification')
      .setDescription(`${interaction.user} submitted a screenshot for rank verification.\n\nStaff: please review the screenshot and select the correct rank below.`)
      .setImage(screenshot.url)
      .setColor(0x000000)
      .setFooter({ text: '#GOKYR' });

    const rows = [];
    for (let i = 0; i < RANKS.length; i += 4) {
      const row = new ActionRowBuilder().addComponents(
        RANKS.slice(i, i + 4).map(rank =>
          new ButtonBuilder()
            .setCustomId(`rankverify_${rank}_${interaction.user.id}`)
            .setLabel(rank)
            .setStyle(ButtonStyle.Secondary)
        )
      );
      rows.push(row);
    }

    await ticketChannel.send({
      content: `<@&${staffRoleId}>`,
      embeds: [embed],
      components: rows,
    });

    await db.collection('kyrbot_rank_verifications').doc(ticketChannel.id).set({
      userId: interaction.user.id,
      guildId: interaction.guild.id,
      status: 'pending',
      screenshotUrl: screenshot.url,
      createdAt: new Date().toISOString(),
    });

    await interaction.editReply({
      content: `✅ Your verification request has been submitted: ${ticketChannel}`,
    });
  },
};
