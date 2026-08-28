const https = require('https');

// --- Fetch latest tweet using Twitter's public syndication endpoint ---
// This is the same unofficial endpoint used by embedded tweet widgets.
// No login required, but Twitter/X can change or block this at any time.
function fetchLatestTweet(username) {
  return new Promise((resolve, reject) => {
    const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${username}?showReplies=false`;

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const match = data.match(/data-tweet-id="(\d+)"/);
          if (!match) return resolve(null);

          const tweetId = match[1];
          resolve({
            id: tweetId,
            url: `https://x.com/${username}/status/${tweetId}`,
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// --- Fetch latest Instagram post using the public web profile info endpoint ---
// Uses a known public app-id header used by Instagram's own web client.
// No login required, but Instagram can rate-limit or block this at any time.
function fetchLatestInstagramPost(username) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'i.instagram.com',
      path: `/api/v1/users/web_profile_info/?username=${username}`,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'x-ig-app-id': '936619743392459',
      },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Instagram returned status ${res.statusCode} (likely blocked/rate-limited)`));
        }

        if (!data || data.trim().length === 0) {
          return reject(new Error('Instagram returned an empty response (likely blocked)'));
        }

        try {
          const json = JSON.parse(data);
          const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges;
          if (!edges || edges.length === 0) return resolve(null);

          const node = edges[0].node;
          resolve({
            id: node.id,
            url: `https://www.instagram.com/p/${node.shortcode}/`,
          });
        } catch (error) {
          reject(new Error(`Instagram response was not valid JSON (likely blocked or changed format): ${data.slice(0, 100)}`));
        }
      });
    }).on('error', reject);
  });
}

module.exports = { fetchLatestTweet, fetchLatestInstagramPost };

// --- Fetch latest YouTube video using the official free RSS feed ---
function fetchLatestYoutubeVideo(channelHandle) {
  return new Promise((resolve, reject) => {
    // First resolve the handle to a channel ID via the channel page
    https.get(`https://www.youtube.com/@${channelHandle}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const idMatch = data.match(/"channelId":"(UC[\w-]+)"/);
        if (!idMatch) return resolve(null);
        const channelId = idMatch[1];

        https.get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
          let feed = '';
          res2.on('data', chunk => feed += chunk);
          res2.on('end', () => {
            const videoIdMatch = feed.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/);
            if (!videoIdMatch) return resolve(null);

            const videoId = videoIdMatch[1];
            resolve({
              id: videoId,
              url: `https://www.youtube.com/watch?v=${videoId}`,
            });
          });
        }).on('error', reject);
      });
    }).on('error', reject);
  });
}

// --- Check if a Twitch channel is currently live (requires free Client ID/Secret) ---
let twitchAccessToken = null;
let twitchTokenExpiry = 0;

async function getTwitchAccessToken() {
  if (twitchAccessToken && Date.now() < twitchTokenExpiry) return twitchAccessToken;

  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
    grant_type: 'client_credentials',
  });

  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: 'POST' });
  const data = await response.json();

  twitchAccessToken = data.access_token;
  twitchTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return twitchAccessToken;
}

async function fetchTwitchLiveStatus(username) {
  const token = await getTwitchAccessToken();

  const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!data.data || data.data.length === 0) return null;

  const stream = data.data[0];
  return {
    id: stream.id,
    url: `https://www.twitch.tv/${username}`,
  };
}

module.exports.fetchLatestYoutubeVideo = fetchLatestYoutubeVideo;
module.exports.fetchTwitchLiveStatus = fetchTwitchLiveStatus;
