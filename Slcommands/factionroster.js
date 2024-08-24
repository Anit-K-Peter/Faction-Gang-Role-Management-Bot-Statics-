const fs = require("fs");
const path = require("path");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("factionroster")
        .setDescription("Get faction roster from available factions")
        .addStringOption((option) =>
            option
                .setName("faction")
                .setDescription("Select a faction")
                .setRequired(true)
                .addChoices(getFactionChoices()),
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // Defer reply to acknowledge the interaction

            const factionId = interaction.options.getString("faction");

            // Fetch faction details based on factionId from faction.json
            const faction = getFactionById(factionId);

            if (!faction) {
                await interaction.editReply("Invalid faction selection.");
                return;
            }

            // Fetch faction members based on factionId from factionroster.json
            const factionMembers = await fetchFactionMembers(factionId);

            if (!factionMembers || factionMembers.length === 0) {
                await interaction.editReply(
                    "No members found for the selected faction."
                );
                return;
            }

            const logoURL = faction.logo;

            // Format members list into a readable format
            const membersList = factionMembers
                .map((member) => `${member.id}, ${member.name}`)
                .join("\n");

            // Construct embed with the members list
            const embed = new EmbedBuilder()
                .setTitle(`Faction Members List for ${faction.name}`)
                .setDescription("```\nId, MemberName\n" + membersList + "\n```")
                .setColor("#0099ff")
                .setThumbnail(logoURL);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Error executing factionroster command:", error);
            await interaction.editReply(
                "There was an error while executing this command."
            );
        }
    },
};

function getFactionChoices() {
    const filePath = path.join(__dirname, "../data/faction.json");
    const data = fs.readFileSync(filePath, "utf8");
    const factions = JSON.parse(data);

    const choices = factions.map((faction) => ({
        name: faction.name,
        value: faction.id.toString(), // Ensure value is a string
    }));

    return choices;
}

function getFactionById(factionId) {
    const filePath = path.join(__dirname, "../data/faction.json");
    const data = fs.readFileSync(filePath, "utf8");
    const factions = JSON.parse(data);

    return factions.find((faction) => faction.id === factionId);
}

async function fetchFactionMembers(factionId) {
    // Here you would fetch the members for the specified factionId
    // For demonstration, assume fetching from factionroster.json
    const rosterFilePath = path.join(__dirname, "../data/factionRoster.json");
    const rosterData = fs.readFileSync(rosterFilePath, "utf8");
    const factionMembers = JSON.parse(rosterData);

    // Filter members based on factionId
    const members = factionMembers.filter(
        (member) => member.factionId === parseInt(factionId)
    );

    return members;
}
