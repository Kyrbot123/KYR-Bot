const RANKS = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Mythic', 'Legendary', 'Master', 'Pro'];

const RANK_COLORS = {
  Bronze: 0xcd7f32,
  Silver: 0xc0c0c0,
  Gold: 0xffd700,
  Diamond: 0xb9f2ff,
  Mythic: 0xa020f0,
  Legendary: 0xff4500,
  Master: 0x00ffff,
  Pro: 0x000000,
};

async function ensureRankRoles(guild) {
  const roles = {};

  for (const rankName of RANKS) {
    let role = guild.roles.cache.find(r => r.name === rankName);

    if (!role) {
      role = await guild.roles.create({
        name: rankName,
        color: RANK_COLORS[rankName],
        reason: 'Auto-created rank role for /rank-verify system',
      });
    }

    roles[rankName] = role;
  }

  return roles;
}

module.exports = { RANKS, ensureRankRoles };
