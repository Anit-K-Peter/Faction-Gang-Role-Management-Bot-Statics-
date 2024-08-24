const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

// Load role permissions from Config.role.json
const rolePermissions = require('../data/Config.role.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeuser')
        .setDescription('Remove a user from a faction or gang.')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID of the user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Specify whether "faction" or "gang"')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator), // Restrict to members with the Admin role for simplicity
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const userId = interaction.options.getInteger('id');
            const type = interaction.options.getString('type').toLowerCase();

            let rosterFilePath;
            let roster;
            let rosterType;

            if (type === 'faction') {
                rosterFilePath = path.join(__dirname, '../data/factionRoster.json');
                roster = require(rosterFilePath);
                rosterType = 'factionId';
            } else if (type === 'gang') {
                rosterFilePath = path.join(__dirname, '../data/gangRoaster.json');
                roster = require(rosterFilePath);
                rosterType = 'gangId';
            } else {
                return interaction.editReply('Invalid type specified. Please specify either "faction" or "gang".');
            }

            const member = interaction.member;
            const userRoles = member.roles.cache;

            // Check if the member has any of the roles specified in the configuration
            const hasPermission = Object.values(rolePermissions).some(roleId => userRoles.has(roleId));

            if (!hasPermission) {
                return interaction.editReply('You do not have permission to remove users.');
            }

            const userIndex = roster.findIndex(user => user.id === userId);

            if (userIndex === -1) {
                return interaction.editReply(`User with ID \`${userId}\` does not exist in the ${type} roster.`);
            }

            roster.splice(userIndex, 1);

            fs.writeFileSync(rosterFilePath, JSON.stringify(roster, null, 2));

            await interaction.editReply(`User with ID \`${userId}\` successfully removed from ${type}.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error while executing this command.');
        }
    },
};
