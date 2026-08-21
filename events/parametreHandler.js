const {
  Events,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
} = require('discord.js');
const db = require('../utils/firebase');

const SETTING_LABELS = {
  announcement_channel: 'Announcement channel',
  logs_channel: 'Logs channel',
  ticket_channel: 'Ticket panel channel',
  ticket_category: 'Ticket category',
};

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isStringSelectMenu() && interaction.customId === 'parametre_select') {
      const settingId = interaction.values[0];
      const isCategory = settingId === 'ticket_category';

      const row = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder()
          .setCustomId(`parametre_channel_${settingId}`)
          .setPlaceholder(`Select the ${SETTING_LABELS[settingId]}`)
          .setChannelTypes(isCategory ? [ChannelType.GuildCategory] : [ChannelType.GuildText])
      );

      return interaction.reply({
        content: `Select the new **${SETTING_LABELS[settingId]}**:`,
        components: [row],
        ephemeral: true,
      });
    }

    if (interaction.isChannelSelectMenu() && interaction.customId.startsWith('parametre_channel_')) {
      const settingId = interaction.customId.replace('parametre_channel_', '');
      const channel = interaction.channels.first();

      await db.collection('kyrbot_config').doc(`settings_${interaction.guild.id}`).set({
        [settingId]: channel.id,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return interaction.update({
        content: `✅ **${SETTING_LABELS[settingId]}** set to ${channel}.`,
        components: [],
      });
    }
  },
};
