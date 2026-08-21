const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/firebase');
const { RANKS } = require('../utils/ranks');
const { buildScrimEmbed } = require('../utils/scrimEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scrim-create')
    .setDescription('Create a scrim announcement')
    .addStringOption(opt =>
      opt.setName('format').setDescription('Scrim format (e.g. 3v3, 5v5)').setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('slots').setDescription('Maximum number of players').setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('date').setDescription('Date and time (unix timestamp)').setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('description').setDescription('Additional details').setRequired(false)
    ),

  async execute(interaction) {
    const member = interaction.member;
    const hasRankRole = member.roles.cache.some(r => RANKS.includes(r.name));

    if (!hasRankRole) {
      return interaction.reply({
        content: '❌ You must verify your rank first with /rank-verify before creating a scrim.',
        ephemeral: true,
      });
    }

    const format = interaction.options.getString('format');
    const slots = interaction.options.getInteger('slots');
    const date = interaction.options.getInteger('date');
    const description = interaction.options.getString('description') || 'No description provided';

    if (slots < 2) {
      return interaction.reply({ content: '❌ Slots must be at least 2.', ephemeral: true });
    }

    if (date * 1000 < Date.now()) {
      return interaction.reply({ content: '❌ The date must be in the future.', ephemeral: true });
    }

    await interaction.deferReply();

    const scrimRef = db.collection('kyrbot_scrims').doc();
    const scrimData = {
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      organizerId: interaction.user.id,
      format,
      description,
      maxPlaces: slots,
      date,
      players: [],
      status: 'open',
      reminderSent: false,
      createdAt: new Date().toISOString(),
    };

    const embed = buildScrimEmbed(scrimData, scrimRef.id);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`scrim_join_${scrimRef.id}`).setLabel('Join').setEmoji('✅').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`scrim_leave_${scrimRef.id}`).setLabel('Leave').setEmoji('❌').setStyle(ButtonStyle.Danger)
    );

    const message = await interaction.editReply({ embeds: [embed], components: [row] });

    await scrimRef.set({ ...scrimData, messageId: message.id });
  },
};
