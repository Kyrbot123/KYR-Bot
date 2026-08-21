const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('self-roles-send')
    .setDescription('[Admin] Send the self-roles panel to a channel')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send the panel to').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const snapshot = await db.collection('kyrbot_self_roles').doc(interaction.guild.id).collection('roles').get();

    if (snapshot.empty) {
      return interaction.reply({ content: '❌ No self-roles configured yet. Use /self-roles-setup add first.', ephemeral: true });
    }

    const roles = snapshot.docs.map(doc => doc.data());

    const descLines = roles.map(r => `${r.emoji} **${r.label}** — <@&${r.roleId}> updates.`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('SELF ROLES')
      .setDescription(`Choose your roles to receive the Kyroz updates you're interested in.\n\n${descLines}`)
      .setColor(0x000000)
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({ text: '#GOKYR' });

    const rows = [];
    for (let i = 0; i < roles.length; i += 4) {
      const row = new ActionRowBuilder().addComponents(
        roles.slice(i, i + 4).map(r =>
          new ButtonBuilder()
            .setCustomId(`selfrole_${r.roleId}`)
            .setLabel(r.label)
            .setEmoji(r.emoji)
            .setStyle(ButtonStyle.Secondary)
        )
      );
      rows.push(row);
    }

    await channel.send({ embeds: [embed], components: rows });

    await interaction.reply({ content: `✅ Self-roles panel sent to ${channel}.`, ephemeral: true });
  },
};
