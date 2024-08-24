// Slcommands/gangs.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gangs')
        .setDescription('Lists all gangs'),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // Defer reply to acknowledge the interaction

            const guild = interaction.guild;
            const guildName = guild.name;
            const guildIconURL = guild.iconURL({ dynamic: true }) ?? '';

            const filePath = path.join(__dirname, '../data/gangs.json'); // Corrected filename to factions.json
            const data = fs.readFileSync(filePath, 'utf8');
            const factions = JSON.parse(data);

            const embed = new EmbedBuilder()
                .setTitle(`Gangs of ${guildName}`)
                .setDescription('<:ping2:1254032627179061249> Below are the Current Gangs Available in our city.')
                .setThumbnail(guildIconURL)
                .setColor('#780000'); // Gold color

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
