const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const OWNER_ID = '1177274553492308048';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('socials-panel')
    .setDescription('Send the official Kyroz socials panel to this channel'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ This command is reserved to the bot owner.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('KYROZ SOCIALS')
      .setDescription(
        "As we enter this new chapter, we are proud to strengthen our presence across all major platforms:\n\n" +
        "• **TikTok** <a:TikTok:1533927532431278170>\n" +
        "• **Instagram** <:insta:1533927852066476133>\n" +
        "• **YouTube** <:YouTube:1533928056371286026>\n" +
        "• **Twitch** <:twitch:1533928247828545696>\n" +
        "• **X** <:twitter_o_x:1533928415751700590>\n" +
        "• **Discord** <:d_discord:1533928600297013329>\n" +
        "• **Email address** 📩\n" +
        "• **Website** <:0developer:1533928944116432956>\n\n" +
        "Follow our journey, discover our projects, tournaments, and competitive teams, and become part of the Kyroz community by proudly representing our colors.\n\n" +
        "**Thank you for your support and trust.**\n\n" +
        "**— The Kyroz Organization** <:Kyremotes:1495339472420606113>"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL());

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Instagram').setStyle(ButtonStyle.Link).setURL('https://www.instagram.com/kyroz_esports?igsh=aHgydTZvdTNleG94&utm_source=qr'),
      new ButtonBuilder().setLabel('YouTube').setStyle(ButtonStyle.Link).setURL('https://www.youtube.com/@Kyrozesports'),
      new ButtonBuilder().setLabel('Twitch').setStyle(ButtonStyle.Link).setURL('https://www.twitch.tv/kyroz_esports'),
      new ButtonBuilder().setLabel('X').setStyle(ButtonStyle.Link).setURL('https://x.com/kyrozesport?s=21'),
      new ButtonBuilder().setLabel('Discord').setStyle(ButtonStyle.Link).setURL('https://discord.gg/Vzb6skuuT2')
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Website').setStyle(ButtonStyle.Link).setURL('https://kyrozesports.netlify.app/')
    );

    await interaction.channel.send({ embeds: [embed], components: [row1, row2] });
    await interaction.reply({ content: '✅ Panel sent.', ephemeral: true });
  },
};
