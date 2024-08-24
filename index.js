// index.js
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, clientId, guildId } = require('./config');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.slashCommands = new Collection();
client.nonSlashCommands = new Collection();

// Load slash commands
const slashCommandsPath = path.join(__dirname, 'Slcommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
    const filePath = path.join(slashCommandsPath, file);
    const command = require(filePath);
    client.slashCommands.set(command.data.name, command);
}

// Load non-slash commands
const nonSlashCommandsPath = path.join(__dirname, 'noncmds');
const nonSlashCommandFiles = fs.readdirSync(nonSlashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of nonSlashCommandFiles) {
    const filePath = path.join(nonSlashCommandsPath, file);
    const command = require(filePath);
    client.nonSlashCommands.set(command.name, command);
}

// Register slash commands
client.once('ready', async () => {
    const rest = new (require('@discordjs/rest').REST)({ version: '10' }).setToken(token);
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            guildId ?
                (require('discord.js').Routes.applicationGuildCommands(clientId, guildId)) :
                (require('discord.js').Routes.applicationCommands(clientId)),
            { body: client.slashCommands.map(command => command.data.toJSON()) },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }

    console.log(`Logged in as ${client.user.tag}!`);
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Handle non-slash commands
client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.nonSlashCommands.get(commandName);

    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

// Example function to handle slash commands
async function handleSlashCommand(interaction) {
    try {
        // Check if the interaction is valid
        if (!interaction.inGuild()) {
            return interaction.reply({ content: 'This command can only be used in a guild.', ephemeral: true });
        }

        // Handle the command logic

        // Example reply
        await interaction.reply({ content: 'Command processed successfully!', ephemeral: true });
    } catch (error) {
        console.error('Error handling slash command:', error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}

// Example event listener for interactions
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'your_command_name') {
        await handleSlashCommand(interaction);
    }
});


client.login(token);
