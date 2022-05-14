const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction, Collection } = require( 'discord.js' );
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
            )
            .addSubcommand( sc => sc
                .setName( 'clear' )
                .setDescription( 'Removes a log from the database using the case ID' )
                .addStringOption( o => o
                    .setName( 'caseid' )
                    .setDescription( 'Case ID of the log you want to remove' )
                    .setRequired( true )
                )
            )
            .addSubcommand( sc => sc
                .setName( 'set-reason' )
                .setDescription( 'Allows you to set or reset the reason of a case or note using the caseID.' )
                .addStringOption( o => o
                    .setName( 'caseid' )
                    .setDescription( 'CaseID you want to refer to' )
                    .setRequired( true )
                )
                .addStringOption( o => o
                    .setName( 'reason' )
                    .setDescription( 'The new reason you would like to change it to.' )
                    .setRequired( true )
                )
            ),
    help: {
        helpName: 'Logs',
        helpDescription: `The logs command has multiple sub commands.\nClear => Clears an infraction from the database using the caseID\nCount => Counts the number of infractions for given user.\nView => Brings all the infractions stored for the given user.\nView With ID => Brings all infractions stored for a user with the given ID.`,
        helpSyntax: `logs <type-of-action> <arguements>`,
        helpEmbed: false
    },
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