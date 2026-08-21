const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const db = require('../utils/firebase');

const SETTINGS = [
  { id: 'announcement_channel', label: 'Announcement channel', emoji: '📢' },
  { id: 'logs_channel', label: 'Logs channel', emoji: '📝' },
  { id: 'ticket_channel', label: 'Ticket panel channel', emoji: '🎫' },
  { id: 'ticket_category', label: 'Ticket category', emoji: '📁' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('[Admin] Configure all bot channels from one panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const configDoc = await db.collection('kyrbot_config').doc(`settings_${interaction.guild.id}`).get();
    const config = configDoc.exists ? configDoc.data() : {};

    const embed = new EmbedBuilder()
      .setTitle('⚙️ Bot Settings')
      .setDescription('Select a setting below to configure it.')
      .setColor(0x010101)
      .setFooter({ text: '#GOKYR' });

    for (const setting of SETTINGS) {
      const value = config[setting.id];
      embed.addFields({
        name: `${setting.emoji} ${setting.label}`,
        value: value ? `<#${value}>` : 'Not set',
        inline: true,
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('parametre_select')
        .setPlaceholder('Choose a setting to configure')
        .addOptions(SETTINGS.map(s => ({ label: s.label, value: s.id, emoji: s.emoji })))
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
