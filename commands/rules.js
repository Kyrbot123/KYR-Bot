const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { BANNER_URL } = require('../utils/branding');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('[Admin] Send the official Kyroz rules to a channel')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to send the rules to').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const rulesEmbed = new EmbedBuilder()
      .setTitle('Official Rules of Kyroz ✅')
      .setDescription(
        "Welcome to Kyroz. To ensure a pleasant and respectful atmosphere for everyone, please read and respect the following rules:\n\n" +
        "🔹 **1. Respect and Behavior**\n" +
        "• Respect between members is mandatory.\n" +
        "• No insulting, discriminatory, hateful, or harassing remarks will be tolerated.\n" +
        "• Conflicts must be resolved calmly or with the help of staff.\n\n" +
        "🔹 **2. Spam and Advertising**\n" +
        "• Spam (repetitive messages, flooding, excessive use of emojis) is prohibited.\n" +
        "• Advertising is prohibited without staff authorization.\n" +
        "• Suspicious or fraudulent links are strictly prohibited.\n\n" +
        "🔹 **3. Content**\n" +
        "• NSFW content (pornographic, shocking, violent) is prohibited.\n" +
        "• Please stay on topic.\n" +
        "• Avoid sensitive topics that could create tension.\n\n" +
        "🔹 **4. Usernames and Profiles**\n" +
        "• Offensive or inappropriate usernames are prohibited.\n" +
        "• Shocking or disrespectful profile pictures are not allowed.\n\n" +
        "🔹 **5. Respect for Staff**\n" +
        "• Staff decisions must be respected.\n" +
        "• Any complaints must be made privately and respectfully.\n" +
        "• Impersonating a staff member is prohibited.\n\n" +
        "🔹 **6. Sanctions**\n" +
        "• Failure to comply with the rules may result in:\n" +
        "»» Warning\n»» Mute\n»» Kick\n»» Ban\n" +
        "Sanctions are applied according to the severity of the offense.\n\n" +
        "🔹 **7. Common Sense**\n" +
        "• Use your common sense in all circumstances.\n" +
        "• If a rule is not explicitly stated, it does not mean that anything goes.\n\n" +
        "By joining Kyroz you agree to these terms and conditions.\n\n" +
        "Thank you for your understanding and enjoy your stay with us!\n\n" +
        "— The Kyroz Team"
      )
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL())
      .setImage(BANNER_URL);

    const acceptEmbed = new EmbedBuilder()
      .setTitle('Accept the rules of KYR | Kyroz to access the entire server')
      .setDescription('To accept the server rules, please interact with the button below!')
      .setColor(0x010101)
      .setThumbnail(interaction.guild.iconURL());

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_rules')
        .setLabel('Accept the rules')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [rulesEmbed] });
    await channel.send({ embeds: [acceptEmbed], components: [row] });

    await interaction.reply({ content: `✅ Rules sent to ${channel}.`, ephemeral: true });
  },
};
