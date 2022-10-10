//libraries
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { maintianerId } = require('../configuration/otherIDs.json');
const {verificationEmbedColor } = require('../configuration/embedColors.json');
const log = require('../logger.js');

//command information
module.exports = {
	//build command
	data: new SlashCommandBuilder()
		.setName('maintenance')
		.setDescription('Commands related to maintaning the bot.')
        .addSubcommand(subcommand =>
            subcommand.setName('ping')
                .setDescription('Returns the latency of the bot.')
            )
        .addSubcommand(subcommand =>
            subcommand.setName('terminate')
                .setDescription('Terminates the bot.')
            )
		.addSubcommand(subcommand =>
			subcommand.setName('verification')
				.setDescription('Creates the verification message in the selected channel.')
				.addChannelOption(option =>
					option.setName('channel')
						.setDescription('The channel where the verification will take place.')
						.setRequired(true)
					)
			),
	
	//run this code if the command is called
	async execute(interaction) {
		//if the command is the ping command run the following
		if(interaction.options.getSubcommand() === 'ping'){
			//get latency
			const apiLatency = Math.round(interaction.client.ws.ping);
			const botLatency = Math.floor(Math.abs(Date.now() - interaction.createdAt));

			//respond to the user
			await interaction.reply(`**Current Latency**\nAPI Latency is around ${apiLatency}ms.\nBot Latency is around ${botLatency}ms.`);

			//log it to the command console
			log.info(`API Latency is around ${apiLatency}ms. Bot Latency is around ${botLatency}ms.`);

			//end command execution
			return;
		}

		//check if the user can use maintinence commands
		if(interaction.user.id === maintianerId){
            //if the subcommand is terminate run the following
            if (interaction.options.getSubcommand() === 'terminate'){
                //tell the user that the bot is being terminated
			    await interaction.reply({content: 'Terminating...', ephemeral: true});

                //log the termination to the console
			    log.info(`Bot is being terminated by ${interaction.user.tag}.`);

                //terminate the bot
        	    process.exit(0);  
            }

			//if the subcommand is verification run the following
			if (interaction.options.getSubcommand() === 'verification'){
				//create the message
				const embed = new MessageEmbed()
					.setColor(verificationEmbedColor)
					.setTitle('Join the Big Chungus Religion!')
					.setDescription(`By clicking the button below and joining the religion you agree to all of our rules. If you break these rules The Council has the right to banish you from the religion.`)
					.setThumbnail(interaction.guild.iconURL())

				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('verification')
							.setStyle('SUCCESS')
							.setLabel('Join')
					)
				
				//get the channel
				const channel = interaction.options.getChannel('channel');

				//send it to the channel
				channel.send({ embeds: [embed], components: [row] });

				//log it to the console
				log.info(`${interaction.user.tag} created a new verification message.`);

				//respond to the user that action was successful
				await interaction.reply({content: 'Verification message created successfully!', ephemeral: true});

				//prevent unecessery if statements
				return;
			}
		} else{
			//respond if error message if user does not have termination permission
			await interaction.reply({content: 'You do not have permissions to run this command.', ephemeral: true});
            
            //log action
			log.warn(`${interaction.user.tag} attempted to access maintenance commands.`);
		}
	},
};
