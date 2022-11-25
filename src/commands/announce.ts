//libraries
import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, Role, GuildMemberRoleManager, ChannelType, GuildTextBasedChannel } from "discord.js";
import { userDBFuncs } from "../types";
import log from "../logger";
import functions from "../functions/_functionList";
const { announcerRoleId } = require("../configuration/otherIDs.json");
const { announcementEmbedColor } = require("../configuration/embedColors.json");

//command information
export = {
    name: "announce",
    ephemeral: true,

	//build the command
	data: new SlashCommandBuilder()
		.setName("announce")
		.setDescription("Creates an announcement.")
        .setDMPermission(false)
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("The channel the announcement will be sent to.")
                .setRequired(true)
            )
        .addStringOption(option =>
            option.setName("announcement")
                .setDescription("The announcement itself.")
                .setRequired(true)
            )
        .addBooleanOption(option =>
            option.setName("crosspost")
                .setDescription("Whether the announcement should be automatically published, if it\'s sent to a announcement channel.")
                .setRequired(true)
            )
        .addStringOption(option =>
            option.setName("title")
                .setDescription("The title of the announcement.")
                .setRequired(false)
            )    
        .addMentionableOption(option =>
            option.setName("ping")
                .setDescription("The role/person that will be pinged, leave blank to not ping anyone.")
                .setRequired(false)
            ),
        
    //when command is called run the following
    async execute(interaction:CommandInteraction){
        //check if the command is a slash command
		if(!interaction.isChatInputCommand()) return;

        //check if user has permissions to make the announcement
        if ((interaction.member?.roles as GuildMemberRoleManager).cache.some((role:Role) => role.id == announcerRoleId)){
            //give error if user does not have permissions
            await interaction.editReply("You do not have permissions to run this command.");
            log.warn(`${interaction.user.tag} attempted to run "/announce".`);
            return;
        }

        //get all of the options
        let title = interaction.options.getString("title");
        const announcement = interaction.options.getString("announcement");
        const crosspost = interaction.options.getBoolean("crosspost");
        const ping = interaction.options.getMentionable("ping");
        const channel = interaction.options.getChannel("channel") as GuildTextBasedChannel;
            
        //make the announcement
        //if user didn't specify title set default title
        if (title == null) title = "New Announcement!";

        //create the embed
        const embed = new EmbedBuilder()
            .setColor(announcementEmbedColor)
            .setTitle(title)
            .setDescription(announcement);
        
        //create the message depending on the ping state
        const userTitle = functions.get("userDB") as userDBFuncs;

        let message = null;
        if(ping != null){
            message = `New Announcement by ${await userTitle.getTitle(interaction.user.id)} ${interaction.user.username}, ${ping}.`;
        } else{
            message = `New Announcement by ${await userTitle.getTitle(interaction.user.id)} ${interaction.user.username}.`;
        }

        //send the message to the channel
        channel.send({content: message, embeds: [embed]}).then(sent => {
            if(channel.type == ChannelType.GuildAnnouncement && crosspost){
                sent.crosspost();
            }
        });
            
        //give confirmation to the user that the command was successful
        await interaction.editReply("Your announcement has been sent and published.");
        log.info(`${interaction.user.tag} made an anouncement.`);
    }
};