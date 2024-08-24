// noncmds/say.js
module.exports = {
    name: 'say',
    description: 'Replies with your input',
    async execute(message, args) {
        if (!args.length) return message.reply('You didn\'t provide any arguments!');
        const sayMessage = args.join(' ');
        await message.channel.send(sayMessage);
    },
};
