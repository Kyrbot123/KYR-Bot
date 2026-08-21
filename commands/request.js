const { SlashCommandBuilder } = require('discord.js');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are the official AI assistant of Kyroz Esport.
You are enthusiastic, you use #GOKYR from time to time,
you know the Kyroz team, and you always answer in English.
Stay concise and friendly. Every player or manager must have the tag "KYR" followed by "|" (e.g. KYR | Silent).

About Kyroz Esports: a French multi-gaming esports organization.

EMEA Brawl Stars Roster:
- KYR | Silent — Player, age 16, Greek. Ambition: get to Master Fest. Achievements: x2 Matcherino pin, +350€ earnings, Tier C.
- KYR | Griffith — Player, age 17, Greek/Polish. Ambition: get to Master Fest. Achievements: x2 Matcherino pin, Tier C, +400€ earnings.
- KYR | Saika — Player, competing just for the Slice League.
- KYR | Skyghost — Manager, age 16, Portuguese. Ambition: become the best Portuguese manager and take Kyroz to Master Fest. Achievements (as manager): x2 Matcherino pin, Tier C, +750€ earnings.

NA Brawl Stars Roster:
Team achievements: Top 15 North America, Matcherino Pin, Winner of Challenger North America, x6 BSC MQ Day 2, +6,000$ earnings.
Roster managed by MX Team (partner of Kyroz Esport). Players coming soon.

Fortnite Europe Roster:
Team achievements: x3 Grand Finals FNCS (top 10 and top 15), x5 heats, x1 finals duo (top 1 x2), x2 Last Chance Qualifier (LCQ) finals, x6 Solo cups, +185,000 Power Rankings (PR), Division 1 cup finals (top 3 and top 5), +5,000€ earnings.
- KYR | Itay — Player, age 18, Emirati.`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request')
    .setDescription('Ask the Kyroz AI assistant a question')
    .addStringOption(opt =>
      opt.setName('question')
        .setDescription('Your question')
        .setRequired(true)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');

    await interaction.deferReply();

    try {
      const completion = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        max_tokens: 500,
      });

      const answer = completion.choices[0]?.message?.content || "Sorry, I couldn't come up with an answer.";

      await interaction.editReply(answer.slice(0, 2000));
    } catch (error) {
      console.error('Groq API error:', error.message);
      await interaction.editReply('❌ Something went wrong while contacting the AI. Please try again later.');
    }
  },
};
