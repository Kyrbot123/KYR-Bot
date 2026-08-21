const db = require('./firebase');

function startScrimScheduler(client) {
  setInterval(async () => {
    try {
      const now = Math.floor(Date.now() / 1000);

      // --- Send 30-minute reminders ---
      const reminderSnapshot = await db.collection('kyrbot_scrims')
        .where('status', 'in', ['open', 'full'])
        .where('reminderSent', '==', false)
        .get();

      for (const doc of reminderSnapshot.docs) {
        const scrim = doc.data();
        const timeUntil = scrim.date - now;

        if (timeUntil <= 1800 && timeUntil > 0 && scrim.players.length > 0) {
          // Ping in channel
          try {
            const channel = await client.channels.fetch(scrim.channelId);
            const mentions = scrim.players.map(id => `<@${id}>`).join(' ');
            await channel.send(`⏰ Reminder: **${scrim.format}** scrim starts <t:${scrim.date}:R>! ${mentions}`);
          } catch (err) {
            console.error('Failed to send channel reminder:', err.message);
          }

          // DM each player
          for (const playerId of scrim.players) {
            try {
              const user = await client.users.fetch(playerId);
              await user.send(`⏰ Reminder: your **${scrim.format}** scrim starts <t:${scrim.date}:R>!`);
            } catch (err) {
              console.error(`Failed to DM ${playerId}:`, err.message);
            }
          }

          await doc.ref.update({ reminderSent: true });
        }
      }

      // --- Mark past scrims as done ---
      const activeSnapshot = await db.collection('kyrbot_scrims')
        .where('status', 'in', ['open', 'full'])
        .get();

      for (const doc of activeSnapshot.docs) {
        const scrim = doc.data();
        if (scrim.date < now - 3600) {
          await doc.ref.update({ status: 'done' });
        }
      }
    } catch (err) {
      console.error('Scrim scheduler error:', err.message);
    }
  }, 60 * 1000);
}

module.exports = { startScrimScheduler };
