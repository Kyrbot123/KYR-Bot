const { EmbedBuilder } = require('discord.js');

function buildScrimEmbed(scrim, scrimId) {
  const playersList = scrim.players.length > 0
    ? scrim.players.map(id => `<@${id}>`).join('\n')
    : 'No one signed up yet.';

  const statusLabel = {
    open: '🟢 Open',
    full: '🔴 Full',
    cancelled: '⚫ Cancelled',
    done: '✅ Done',
  }[scrim.status] || scrim.status;

  const embed = new EmbedBuilder()
    .setTitle(`⚔️ Scrim — ${scrim.format}`)
    .setDescription(scrim.description || 'No description provided')
    .addFields(
      { name: 'Organizer', value: `<@${scrim.organizerId}>`, inline: true },
      { name: 'Status', value: statusLabel, inline: true },
      { name: 'Date', value: `<t:${scrim.date}:F> (<t:${scrim.date}:R>)` },
      { name: `Players (${scrim.players.length}/${scrim.maxPlaces})`, value: playersList }
    )
    .setColor(scrim.status === 'cancelled' ? 0x555555 : 0x000000)
    .setFooter({ text: `Scrim ID: ${scrimId} • #GOKYR` });

  return embed;
}

module.exports = { buildScrimEmbed };
