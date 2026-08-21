const { SlashCommandBuilder, ActivityType } = require('discord.js');

const OWNER_ID = '1177274553492308048';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status-change')
    .setDescription('[Owner only] Change the bot status until next restart')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('New status text')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Activity type')
        .setRequired(false)
        .addChoices(
          { name: 'Watching', value: 'Watching' },
          { name: 'Playing', value: 'Playing' },
          { name: 'Listening', value: 'Listening' },
          { name: 'Competing', value: 'Competing' },
        )
    ),

  async execute(interaction, client) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ You are not allowed to use this command.',
        ephemeral: true,
      });
    }

    const text = interaction.options.getString('text');
    const typeInput = interaction.options.getString('type') || 'Watching';

    const typeMap = {
      Watching: ActivityType.Watching,
      Playing: ActivityType.Playing,
      Listening: ActivityType.Listening,
      Competing: ActivityType.Competing,
    };

    client.user.setPresence({
      activities: [{ name: text, type: typeMap[typeInput] }],
      status: 'online',
    });

    await interaction.reply({
      content: `✅ Status updated to: **${typeInput} ${text}** (until next restart)`,
      ephemeral: true,
    });
  },
};
