const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');

// Load role permissions from Config.role.json
const rolePermissions = require('../data/Config.role.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('adduser')
        .setDescription('Add a user to a faction or gang.')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID of the user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('ingamename')
                .setDescription('The in-game name of the user')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Specify whether "faction" or "gang"')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('factiongangid')
                .setDescription('ID of the faction or gang')
                .setRequired(true)),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Fetch options from interaction
            const userId = interaction.options.getInteger('id');
            const ingameName = interaction.options.getString('ingamename');
            const type = interaction.options.getString('type').toLowerCase(); // Convert to lowercase for case insensitivity
            const factionGangId = interaction.options.getInteger('factiongangid');

            let rosterFilePath;
            let roster;
            let rosterType;

            // Determine the roster file and roster type based on 'type' option
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

            const newUserId = userId;

            // Check if user ID already exists
            if (roster.some(user => user.id === newUserId)) {
                return interaction.editReply(`User with ID \`${newUserId}\` already exists.`);
            }

            // Check permissions based on user's roles
            const member = interaction.member;
            const userRoles = member.roles.cache;

            let hasPermission = false;

            // Loop through role permissions from Config.role.json
            for (const roleName in rolePermissions) {
                if (userRoles.has(rolePermissions[roleName])) {
                    hasPermission = true;
                    break;
                }
            }

            // If user doesn't have permission, deny adding user
            if (!hasPermission) {
                return interaction.editReply('You do not have permission to add users.');
            }

            // Add user to roster
            roster.push({ id: newUserId, name: ingameName, [rosterType]: factionGangId });

            // Write updated roster back to file
            fs.writeFileSync(rosterFilePath, JSON.stringify(roster, null, 2));

            await interaction.editReply(`User "${ingameName}" successfully added to ${type}.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error while executing this command.');
        }
    },
};
