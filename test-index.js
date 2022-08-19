//configure enviroment variables
require('dotenv').config();

//tell the user that the bot is preparing
console.log('Preparing for bot activation...');

// Require the necessary libraries
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');

// Create a new client instance
console.log('Creating new client instance...');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS], disableEveryone: false});
client.commands = new Collection();
client.otherInteractions = new Collection();
client.functions = new Collection();

//add the commands to the client command collection
console.log('Adding commands to the clients command collection...');
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

//add events to the client event collections
console.log('Adding events to the client event collection...')
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

//add other interactions to the client other interaction collection
console.log('Adding other interaction to the clients other interaction collection...');
const interactionPath = path.join(__dirname, 'interactions');
const interactionFiles = fs.readdirSync(interactionPath).filter(file => file.endsWith('.js'));

for (const file of interactionFiles) {
	const filePath = path.join(interactionPath, file);
	const interaction = require(filePath);
	client.otherInteractions.set(interaction.name, interaction);
}

//add functions to the client function collection
console.log('Adding functions to the clients function collection...');
const functionPath = path.join(__dirname, 'functions');
const functionFiles = fs.readdirSync(functionPath).filter(file => file.endsWith('.js'));

for (const file of functionFiles) {
	const filePath = path.join(functionPath, file);
	const botFunction = require(filePath);
	client.functions.set(botFunction.name, botFunction);
}

//let the user know that the bot is almost ready
console.log('Preforming final preparations...');

// Login to Discord with your client's token
console.log('Logging in...');
client.login(process.env.DISCORD_TEST_BOT_TOKEN);

// When the client is ready, run this code (only once)
client.once('ready', () => {
	client.user.setPresence({ activities: [{ name: 'Hosting Update', type: 'LISTENING'}], status: 'online' });
	console.log('The bot is ready!');
});