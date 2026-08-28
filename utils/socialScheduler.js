const db = require('./firebase');
const { fetchLatestTweet, fetchLatestInstagramPost, fetchLatestYoutubeVideo, fetchTwitchLiveStatus } = require('./socialScraper');

const X_USERNAME = 'KyrozEsport';
const INSTAGRAM_USERNAME = 'kyroz_esports';
const YOUTUBE_HANDLE = 'Kyrozesports';
const TWITCH_USERNAME = 'kyroz_esports';
const PING_ROLE_ID = '1494454160270032977';
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

async function getConfig() {
  const doc = await db.collection('kyrbot_config').doc('socials_channel').get();
  return doc.exists ? doc.data().channelId : null;
}

async function checkX(client, channelId) {
  try {
    const latest = await fetchLatestTweet(X_USERNAME);
    if (!latest) return;

    const trackingRef = db.collection('kyrbot_social_tracking').doc('x');
    const trackingDoc = await trackingRef.get();
    const lastSeenId = trackingDoc.exists ? trackingDoc.data().lastId : null;

    if (latest.id === lastSeenId) return;

    await trackingRef.set({ lastId: latest.id });

    // Don't ping on the very first run (no baseline yet)
    if (!lastSeenId) return;

    const channel = await client.channels.fetch(channelId);
    if (channel) {
      await channel.send(
        `<@&${PING_ROLE_ID}>\n**Kyroz just posted a new Tweet ! ❤️ & ♻️**\n${latest.url}`
      );
    }
  } catch (error) {
    console.error('❌ X scraper error:', error.message);
  }
}

async function checkInstagram(client, channelId) {
  try {
    const latest = await fetchLatestInstagramPost(INSTAGRAM_USERNAME);
    if (!latest) return;

    const trackingRef = db.collection('kyrbot_social_tracking').doc('instagram');
    const trackingDoc = await trackingRef.get();
    const lastSeenId = trackingDoc.exists ? trackingDoc.data().lastId : null;

    if (latest.id === lastSeenId) return;

    await trackingRef.set({ lastId: latest.id });

    // Don't ping on the very first run (no baseline yet)
    if (!lastSeenId) return;

    const channel = await client.channels.fetch(channelId);
    if (channel) {
      await channel.send(
        `<@&${PING_ROLE_ID}>\n**Kyroz just posted a new Instagram post! ❤️ & ♻️**\n${latest.url}`
      );
    }
  } catch (error) {
    console.error('❌ Instagram scraper error:', error.message);
  }
}

async function checkYoutube(client, channelId) {
  try {
    const latest = await fetchLatestYoutubeVideo(YOUTUBE_HANDLE);
    if (!latest) return;

    const trackingRef = db.collection('kyrbot_social_tracking').doc('youtube');
    const trackingDoc = await trackingRef.get();
    const lastSeenId = trackingDoc.exists ? trackingDoc.data().lastId : null;

    if (latest.id === lastSeenId) return;

    await trackingRef.set({ lastId: latest.id });
    if (!lastSeenId) return;

    const channel = await client.channels.fetch(channelId);
    if (channel) {
      await channel.send(
        `<@&${PING_ROLE_ID}>\n**Kyroz just posted a new video! 🎥**\n${latest.url}`
      );
    }
  } catch (error) {
    console.error('❌ YouTube scraper error:', error.message);
  }
}

async function checkTwitch(client, channelId) {
  try {
    const live = await fetchTwitchLiveStatus(TWITCH_USERNAME);

    const trackingRef = db.collection('kyrbot_social_tracking').doc('twitch');
    const trackingDoc = await trackingRef.get();
    const wasLive = trackingDoc.exists ? trackingDoc.data().isLive : false;
    const lastStreamId = trackingDoc.exists ? trackingDoc.data().lastId : null;

    if (live && live.id !== lastStreamId && !wasLive) {
      await trackingRef.set({ isLive: true, lastId: live.id });

      const channel = await client.channels.fetch(channelId);
      if (channel) {
        await channel.send(
          `<@&${PING_ROLE_ID}>\n**Kyroz is live on Twitch! 🔴**\n${live.url}`
        );
      }
    } else if (!live && wasLive) {
      await trackingRef.set({ isLive: false, lastId: lastStreamId }, { merge: true });
    }
  } catch (error) {
    console.error('❌ Twitch API error:', error.message);
  }
}

function startSocialScheduler(client) {
  setInterval(async () => {
    const channelId = await getConfig();
    if (!channelId) return; // not configured yet, skip silently

    await checkX(client, channelId);
    await checkInstagram(client, channelId);
    await checkYoutube(client, channelId);
    await checkTwitch(client, channelId);
  }, CHECK_INTERVAL_MS);
}

module.exports = { startSocialScheduler };
