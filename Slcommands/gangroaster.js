const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gangroster")
        .setDescription("Get gang roster from available gangs")
        .addStringOption((option) =>
            option
                .setName("gang")
                .setDescription("Select a gang")
                .setRequired(true)
                .addChoices(getgangChoices()),
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // Defer reply to acknowledge the interaction

            const gangId = interaction.options.getString("gang");

            // Fetch gang details based on gangId from gang.json
            const gang = getgangById(gangId);

            if (!gang) {
                await interaction.editReply("Invalid gang selection.");
                return;
            }

            // Fetch gang members based on gangId from gangroster.json
            const gangMembers = await fetchgangMembers(gangId);

            if (!gangMembers || gangMembers.length === 0) {
                await interaction.editReply(
                    "No members found for the selected gang."
                );
                return;
            }

            const logoURL = gang.logo;

            // Format members list into a readable format
            const membersList = gangMembers
                .map((member) => `${member.id}, ${member.name}`)
                .join("\n");

            // Construct embed with the members list
            const embed = new EmbedBuilder()
                .setTitle(`Gang Members List for ${gang.name}`)
                .setDescription("```\nId, MemberName\n" + membersList + "\n```")
                .setColor("#ff0000")
                .setThumbnail(logoURL);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Error executing gangroster command:", error);
            await interaction.editReply(
                "There was an error while executing this command."
            );
        }
    },
};

function getgangChoices() {
    const filePath = path.join(__dirname, "../data/gangs.json");
    const data = fs.readFileSync(filePath, "utf8");
    const gangs = JSON.parse(data);

    const choices = gangs.map((gang) => ({
        name: gang.name,
        value: gang.id.toString(), // Ensure value is a string
    }));

    return choices;
}

function getgangById(gangId) {
    const filePath = path.join(__dirname, "../data/gangs.json");
    const data = fs.readFileSync(filePath, "utf8");
    const gangs = JSON.parse(data);

    return gangs.find((gang) => gang.id === gangId);
}

async function fetchgangMembers(gangId) {
    // Here you would fetch the members for the specified gangId
    // For demonstration, assume fetching from gangroster.json
    const rosterFilePath = path.join(__dirname, "../data/gangRoaster.json");
    const rosterData = fs.readFileSync(rosterFilePath, "utf8");
    const gangMembers = JSON.parse(rosterData);

    // Filter members based on gangId
    const members = gangMembers.filter(
        (member) => member.gangId === parseInt(gangId)
    );

    return members;
}
