const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const db = require('../utils/firebase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-reasons')
    .setDescription('[Admin] Add, edit or remove a ticket reason')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Add a new ticket reason')
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('Unique id for this reason (no spaces, e.g. billing)')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('label')
            .setDescription('Text shown in the dropdown')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('emoji')
            .setDescription('Emoji shown next to the reason')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Edit an existing ticket reason')
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('Id of the reason to edit')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('label')
            .setDescription('New text shown in the dropdown')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt.setName('emoji')
            .setDescription('New emoji')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Delete a ticket reason')
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('Id of the reason to delete')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all current ticket reasons')
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const reasonsRef = db.collection('kyrbot_ticket_reasons').doc(guildId).collection('reasons');

    if (sub === 'add') {
      const id = interaction.options.getString('id').toLowerCase().replace(/\s+/g, '_');
      const label = interaction.options.getString('label');
      const emoji = interaction.options.getString('emoji') || '📝';

      const existing = await reasonsRef.doc(id).get();
      if (existing.exists) {
        return interaction.reply({ content: `❌ A reason with id \`${id}\` already exists.`, ephemeral: true });
      }

      await reasonsRef.doc(id).set({ label, emoji, createdAt: new Date().toISOString() });

      return interaction.reply({ content: `✅ Reason added: ${emoji} **${label}** (id: \`${id}\`)`, ephemeral: true });
    }

    if (sub === 'edit') {
      const id = interaction.options.getString('id').toLowerCase().replace(/\s+/g, '_');
      const label = interaction.options.getString('label');
      const emoji = interaction.options.getString('emoji');

      const docRef = reasonsRef.doc(id);
      const existing = await docRef.get();
      if (!existing.exists) {
        return interaction.reply({ content: `❌ No reason found with id \`${id}\`.`, ephemeral: true });
      }

      const updates = {};
      if (label) updates.label = label;
      if (emoji) updates.emoji = emoji;

      if (Object.keys(updates).length === 0) {
        return interaction.reply({ content: '❌ Provide at least a new label or emoji.', ephemeral: true });
      }

      await docRef.update(updates);

      return interaction.reply({ content: `✅ Reason \`${id}\` updated.`, ephemeral: true });
    }

    if (sub === 'remove') {
      const id = interaction.options.getString('id').toLowerCase().replace(/\s+/g, '_');
      const docRef = reasonsRef.doc(id);
      const existing = await docRef.get();

      if (!existing.exists) {
        return interaction.reply({ content: `❌ No reason found with id \`${id}\`.`, ephemeral: true });
      }

      await docRef.delete();

      return interaction.reply({ content: `✅ Reason \`${id}\` deleted.`, ephemeral: true });
    }

    if (sub === 'list') {
      const snapshot = await reasonsRef.get();

      if (snapshot.empty) {
        return interaction.reply({ content: 'No ticket reasons configured yet. Default reasons will be used.', ephemeral: true });
      }

      const list = snapshot.docs.map(doc => {
        const d = doc.data();
        return `${d.emoji || '📝'} **${d.label}** — id: \`${doc.id}\``;
      }).join('\n');

      return interaction.reply({ content: `**Current ticket reasons:**\n${list}`, ephemeral: true });
    }
  },
};
