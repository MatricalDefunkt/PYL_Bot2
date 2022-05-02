const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction, Collection } = require( 'discord.js' );
const { Infractions } = require( '../database/database' );
const path = require( 'path' );
const fs = require( 'fs' );

const subCommands = new Collection()
const subCommandFiles = fs.readdirSync( path.join( __dirname, './commands_slash_sub/logs' ) ).filter( file => file.endsWith( '.js' ) );
subCommandFiles.forEach( file =>
{
    const subCommand = require( `./commands_slash_sub/logs/${ file }` );
    subCommands.set( subCommand.data.name, subCommand );
} )

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'logs' )
            .setDescription( 'Get logs of a user.' )
            .addSubcommand( sc => sc
                .setName( 'view' )
                .setDescription( 'Brings the logs of the user with caseID, Mod, User and Type.' )
                .addUserOption( o => o
                    .setName( 'target' )
                    .setDescription( 'User to get the logs of.' )
                    .setRequired( true )
                )
            )
            .addSubcommand( sc => sc
                .setName( 'view_with_id' )
                .setDescription( 'Brings the logs of the user with caseID, Mod, User and Type, using a user ID' )
                .addStringOption( o => o
                    .setName( 'target' )
                    .setDescription( 'UserID to get the logs of.' )
                    .setRequired( true )
                )
            )
            .addSubcommand( sc => sc
                .setName( 'count' )
                .setDescription( 'Brings the counts of infractions, sorted on the type.' )
                .addUserOption( o => o
                    .setName( 'target' )
                    .setDescription( 'User to get the logs of.' )
                    .setRequired( true )
                )
            ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of Logs" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'Logs' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /logs <target>\`\`\`\n\`\`\`\nUse:\nThe logs comamnd returns with all the infractions / notes for a given user for this server.\`\`\``
        ),
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     * @returns {Promise<void>}
     */
    async execute ( interaction, client )
    {

        await interaction.deferReply( { ephemeral: true } );

        const subCommand = subCommands.get( interaction.options.getSubcommand() )

        if ( subCommand )
        {
            try
            {
                await subCommand.execute( client, interaction )
                return;
            } catch ( e )
            {
                await interaction.editReply( { content: 'There was an error. Please contact Matrical ASAP' } )
                console.error( e )
            }
        } else
        {
            await interaction.editReply( { content: `This sub-command doesn't exist as of now. I am working on it! :)` } )
        }
        return;
    }
}