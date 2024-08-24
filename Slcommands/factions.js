// Slcommands/factions.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('factions')
        .setDescription('Lists all available factions'),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // Defer reply to acknowledge the interaction

            const guild = interaction.guild;
            const guildIconURL = guild.iconURL({ dynamic: true }) ?? '';

            const filePath = path.join(__dirname, '../data/faction.json'); // Corrected filename to factions.json
            const data = fs.readFileSync(filePath, 'utf8');
            const factions = JSON.parse(data);

            const embed = new EmbedBuilder()
                .setTitle('Chiefs of Factions')
                .setDescription('<:ping2:1254032627179061249> Below are the current chiefs for each faction. Please reach out to them for any faction-specific inquiries or coordination.')
                .setThumbnail(guildIconURL)
                .setColor('#FFD700'); // Gold color

            factions.forEach(faction => {
                embed.addFields({ name: `${faction.emoji} ║ ${faction.id} ${faction.name} Chief`, value: `<:ping2:1254032627179061249> ${faction.chief}` });
            });

            await interaction.editReply({ embeds: [embed.toJSON()] }); // Edit the deferred reply with the final response
        } catch (error) {
            console.error(error);
            await interaction.reply('There was an error while executing this command.'); // Handle errors gracefully
        }
    },
};
