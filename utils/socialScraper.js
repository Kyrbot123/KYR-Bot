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
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

module.exports = { fetchLatestTweet, fetchLatestInstagramPost };
