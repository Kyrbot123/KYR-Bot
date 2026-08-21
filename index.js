require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const http = require('http');
const fs = require('fs');
const path = require('path');

// --- Keep-alive server (required for Render free tier) ---
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('KYR Bot is alive');
}).listen(process.env.PORT || 3000);

// --- Discord client ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

// --- Load commands from /commands ---
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
    }
  }
}

// --- Load events from /events ---
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.name && event.execute) {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}

// --- When the bot is ready ---
client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'Watching : #GOKYR' }],
    status: 'online',
  });

  const { startScrimScheduler } = require('./utils/scrimScheduler');
  startScrimScheduler(client);
  console.log('⏰ Scrim reminder scheduler started.');
});

// --- Handle slash commands ---
const OWNER_ID = '1177274553492308048';
const db = require('./utils/firebase');

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(`Command received: /${interaction.commandName}`);

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  // Maintenance mode check (owner bypasses)
  if (interaction.user.id !== OWNER_ID && interaction.commandName !== 'maintenance') {
    try {
      const doc = await db.collection('kyrbot_config').doc('maintenance').get();
      if (doc.exists && doc.data().active) {
        const { end, reason } = doc.data();
        return interaction.reply({
          content: `🛠️ The bot is currently under maintenance.\nBack: <t:${end}:R>\nReason: ${reason}`,
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error('Maintenance check failed:', err.message);
    }
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    const reply = { content: 'An error occurred.', ephemeral: true };
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    } catch (replyError) {
      console.error('Failed to send error reply (interaction likely expired):', replyError.message);
    }
  }
});

// --- Prevent the whole bot from crashing on unexpected errors ---
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

client.login(process.env.DISCORD_TOKEN);
