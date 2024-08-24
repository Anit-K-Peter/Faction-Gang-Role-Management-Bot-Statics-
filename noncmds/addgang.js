// noncmds/addgang.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, MessageCollector, Interaction } = require('discord.js');

module.exports = {
    name: 'addgang',
    description: 'Initiates the process to add a new gang',
    async execute(message) {
        const cancelId = 'cancel_addgang';
        const startId = 'start_addgang';

        const startButton = new ButtonBuilder()
            .setCustomId(startId)
            .setLabel('Start Adding Gang')
            .setStyle('1');

        const row = new ActionRowBuilder().addComponents(startButton);

        const embed = new EmbedBuilder()
            .setColor('#780000')
            .setTitle('Add New Gang')
            .setDescription('Click the button below to start adding a new gang.');

        const messageSent = await message.channel.send({ embeds: [embed], components: [row] });

        const filter = interaction => interaction.isButton() && interaction.customId === startId && interaction.user.id === message.author.id;

        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async interaction => {
            await interaction.reply({ content: 'Process started. Please Give An Id for your gang In the row from the gangs list', ephemeral: true });

            const questions = [
                'Enter the ID for the new gang:',
                'Enter the name of the new gang:',
                'Enter the description of the new gang:',
                'Enter the name of the chief of the new gang:',
                'Enter the emoji for the new gang:'
            ];
            const answers = [];

            let currentQuestion = 0;

            const messageCollector = message.channel.createMessageCollector({
                filter: m => m.author.id === message.author.id,
                time: 60000, // Timeout after 1 minute
                max: questions.length // Stop after all questions are answered
            });

            messageCollector.on('collect', m => {
                answers.push(m.content.trim());
                currentQuestion++;

                if (currentQuestion < questions.length) {
                    interaction.followUp(questions[currentQuestion]);
                } else {
                    messageCollector.stop();
                }
            });

            messageCollector.on('end', async collected => {
                if (collected.size < questions.length) {
                    return interaction.followUp('Command canceled or timed out. gang not added.');
                }

                const [id, name, description, chief, emoji] = answers;

                const filePath = path.join(__dirname, '../data/gangs.json');
                const gangs = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // Check if gang ID already exists
                if (gangs.some(gang => gang.id === id)) {
                    return interaction.followUp(`gang with ID \`${id}\` already exists.`);
                }

                // Add new gang
                gangs.push({ id, name, description, chief, emoji });
                fs.writeFileSync(filePath, JSON.stringify(gangs, null, 2), 'utf8');

                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('New gang Added')
                    .addFields(
                        { name: 'ID', value: id },
                        { name: 'Name', value: name },
                        { name: 'Description', value: description },
                        { name: 'Chief', value: chief },
                        { name: 'Emoji', value: emoji }
                    );

                await interaction.followUp({ embeds: [successEmbed] });
            });
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await messageSent.edit('No response after 1 minute. gang not added.');
            }
        });
    },
};
