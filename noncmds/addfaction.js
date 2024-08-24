const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, MessageCollector } = require('discord.js');

module.exports = {
    name: 'addfaction',
    description: 'Initiates the process to add a new faction',
    async execute(message) {
        const startId = 'start_addfaction';

        // Create a button to start the faction adding process
        const startButton = new ButtonBuilder()
            .setCustomId(startId)
            .setLabel('Start Adding Faction')
            .setStyle('1');

        // Create an action row containing the start button
        const row = new ActionRowBuilder().addComponents(startButton);

        // Create an embed to prompt the user
        const embed = new EmbedBuilder()
            .setColor('#00FFFF')
            .setTitle('Add New Faction')
            .setDescription('Click the button below to start adding a new faction.');

        // Send the initial message with the embed and button
        const messageSent = await message.channel.send({ embeds: [embed], components: [row] });

        // Filter for the button interaction
        const filter = interaction => interaction.isButton() && interaction.customId === startId && interaction.user.id === message.author.id;

        // Create a button collector
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async interaction => {
            await interaction.reply({ content: 'Process started. Please provide the details for the new faction.', ephemeral: true });

            const questions = [
                'Enter the ID for the new faction:',
                'Enter the name of the new faction:',
                'Enter the description of the new faction:',
                'Enter the name of the chief of the new faction:',
                'Enter the emoji for the new faction:',
                'Enter the logo URL for the new faction:'
            ];
            const answers = [];

            let currentQuestion = 0;

            // Create a message collector for collecting answers
            const messageCollector = message.channel.createMessageCollector({
                filter: m => m.author.id === message.author.id,
                time: 60000, // Timeout after 1 minute
                max: questions.length // Stop after all questions are answered
            });

            messageCollector.on('collect', m => {
                answers.push(m.content.trim());
                currentQuestion++;

                if (currentQuestion < questions.length) {
                    interaction.followUp({ content: questions[currentQuestion], ephemeral: true });
                } else {
                    messageCollector.stop();
                }
            });

            messageCollector.on('end', async collected => {
                if (collected.size < questions.length) {
                    return interaction.followUp('Command canceled or timed out. Faction not added.');
                }

                const [id, name, description, chief, emoji, logoURL] = answers;

                const filePath = path.join(__dirname, '../data/faction.json');
                const factions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // Check if faction ID already exists
                if (factions.some(faction => faction.id === id)) {
                    return interaction.followUp(`Faction with ID \`${id}\` already exists.`);
                }

                // Add new faction
                factions.push({ id, name, description, chief, emoji, logoURL });
                fs.writeFileSync(filePath, JSON.stringify(factions, null, 2), 'utf8');

                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('New Faction Added BOT NEED RESTART TO UPDATE SLASHCOMMAND')
                    .addFields(
                        { name: 'ID', value: id },
                        { name: 'Name', value: name },
                        { name: 'Description', value: description },
                        { name: 'Chief', value: chief },
                        { name: 'Emoji', value: emoji },
                        { name: 'Logo URL', value: logoURL }
                    );

                await interaction.followUp({ embeds: [successEmbed] });
            });
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await messageSent.edit('No response after 1 minute. Faction not added.');
            }
        });
    },
};
