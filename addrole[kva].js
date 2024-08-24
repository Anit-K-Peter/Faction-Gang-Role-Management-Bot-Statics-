const { Permissions, GuildMember, Message } = require('discord.js');

// Predefined roles with their IDs
const roleIDs = {
    role1: '1240546156594073607',// Reciver Role
    role2: '1240546156606521367' // Sender Role
};

module.exports = {
    name: 'addrolekva',
    description: 'Add or remove role1 from a user using role2. Only users with role2 can use this command.',
    /**
     * Execute the command.
     * @param {Message} message The message object.
     * @param {string[]} args The command arguments.
     */
    async execute(message, args) {
        // Check if the user invoking the command has role2 (giver role)
        if (!message.member.roles.cache.has(roleIDs.role2)) {
            return message.reply('You do not have permission to use this command.');
        }

        // Check if the command was used correctly
        if (args.length !== 2) {
            return message.reply('Usage: !addrolekva @User <give/remove>');
        }

        // Parse command arguments
        const targetUser = message.mentions.members.first();
        if (!(targetUser instanceof GuildMember)) {
            return message.reply('Please mention a user to add/remove role1.');
        }

        const operation = args[1].toLowerCase(); // 'give' or 'remove'
        if (!['give', 'remove'].includes(operation)) {
            return message.reply('Please specify whether to "give" or "remove" role1.');
        }

        const roleID = roleIDs.role1; // Role ID for role1 (receiving role)
        const role = message.guild.roles.cache.get(roleID);
        if (!role) {
            return message.reply(`Role with ID ${roleID} not found.`);
        }

        try {
            if (operation === 'give') {
                await targetUser.roles.add(role);
                message.reply(`Role "${role.name}" added to ${targetUser}`);
            } else if (operation === 'remove') {
                await targetUser.roles.remove(role);
                message.reply(`Role "${role.name}" removed from ${targetUser}`);
            }
        } catch (error) {
            console.error('Error adding/removing role:', error);
            message.reply('There was an error adding/removing the role.');
        }
    },
};
