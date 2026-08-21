const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const CATEGORIES = [
  {
    name: '🎫 Tickets',
    commands: ['ticket-setup', 'ticket-reasons', 'ticket-message'],
  },
  {
    name: '🎭 Self-Roles',
    commands: ['self-roles-setup', 'self-roles-send'],
  },
  {
    name: '📜 Rules',
    commands: ['rules'],
  },
  {
    name: '⚔️ Scrims',
    commands: ['scrim-create', 'scrim-list', 'scrim-cancel', 'scrim-edit'],
  },
  {
    name: '🏆 Rank Verification',
    commands: ['rank-verify', 'rank-verify-setup'],
  },
  {
    name: '⚙️ Administration',
    commands: ['settings', 'announce', 'maintenance', 'status-change'],
  },
  {
    name: '🤖 AI',
    commands: ['request'],
  },
  {
    name: '🔗 General',
    commands: ['kyroz', 'shop', 'ping'],
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kyroz')
    .setDescription('About the Kyroz bot and list of commands'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('👋 Hey! I\'m the official Kyroz bot')
      .setDescription("Here to keep you updated and help you around the server. #GOKYR\n\nHere's what I can do:")
      .setColor(0x010101)
      .setFooter({ text: '#GOKYR' });

    for (const category of CATEGORIES) {
      const lines = category.commands
        .map(name => client.commands.get(name))
        .filter(Boolean)
        .map(cmd => `\`/${cmd.data.name}\` — ${cmd.data.description}`);

      if (lines.length > 0) {
        embed.addFields({ name: category.name, value: lines.join('\n') });
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
