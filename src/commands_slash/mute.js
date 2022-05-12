const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction, Collection } = require( 'discord.js' );
const path = require( 'path' );
const fs = require( 'fs' );

const subCommands = new Collection()
const subCommandFiles = fs.readdirSync( path.join( __dirname, './commands_slash_sub/mute' ) ).filter( file => file.endsWith( '.js' ) );
subCommandFiles.forEach( file =>
{
    const subCommand = require( `./commands_slash_sub/mute/${ file }` );
    subCommands.set( subCommand.data.name, subCommand );
} )

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'mute' )
            .setDescription( 'Mutes the given user.' )
            .addSubcommand( sc => sc
                .setName( 'permanant' )
                .setDescription( 'Mutes a user, permanantly.' )
                .addUserOption( o => o
                    .setName( 'user' )
                    .setDescription( 'User to mute' )
                    .setRequired( true )
                )
                .addIntegerOption( o => o
                    .setName( 'reason' )
                    .setDescription( 'Reason for the mute (Will appear in Audit Logs)' )
                    .addChoices( [
                        [ 'Custom Reason', 0 ],
                        [ 'Gen Rule#1', 101 ],
                        [ 'Gen Rule#2', 102 ],
                        [ 'Gen Rule#3', 103 ],
                        [ 'Gen Rule#4', 104 ],
                        [ 'Gen Rule#5', 105 ],
                        [ 'Gen Rule#6', 106 ],
                        [ 'Gen Rule#7', 107 ],
                        [ 'Gen Rule#8', 108 ],
                        [ 'Voice Rule#1', 201 ],
                        [ 'Voice Rule#2', 202 ],
                        [ 'Voice Rule#3', 203 ],
                        [ 'Voice Rule#4', 204 ],
                        [ 'Voice Rule#5', 205 ],
                        [ 'Voice Rule#6', 206 ],
                        [ 'Voice Rule#7', 207 ]
                    ] )
                    .setRequired( true )
                )
                .addStringOption( o => o
                    .setName( 'custom-reason' )
                    .setDescription( 'Please type the custom reason for the mute if you have chosen "Custom Reason" under \'Reason\'' )
                )
            )
            .addSubcommand( sc => sc
                .setName( 'temporary' )
                .setDescription( 'mutes a user, temporarily.' )
                .addUserOption( ( o ) =>
                    o.setName( "user" ).setDescription( "User to mute" ).setRequired( true )
                )
                .addIntegerOption( ( o ) => o
                    .setName( "reason" )
                    .setDescription(
                        "Reason for the mute (Will appear in Audit Logs)"
                    )
                    .addChoices( [
                        [ "Custom Reason", 0 ],
                        [ "Gen Rule#1", 101 ],
                        [ "Gen Rule#2", 102 ],
                        [ "Gen Rule#3", 103 ],
                        [ "Gen Rule#4", 104 ],
                        [ "Gen Rule#5", 105 ],
                        [ "Gen Rule#6", 106 ],
                        [ "Gen Rule#7", 107 ],
                        [ "Gen Rule#8", 108 ],
                        [ "Voice Rule#1", 201 ],
                        [ "Voice Rule#2", 202 ],
                        [ "Voice Rule#3", 203 ],
                        [ "Voice Rule#4", 204 ],
                        [ "Voice Rule#5", 205 ],
                        [ "Voice Rule#6", 206 ],
                        [ "Voice Rule#7", 207 ],
                    ] )
                    .setRequired( true )
                )
                .addStringOption( ( o ) => o
                    .setName( "duration" )
                    .setDescription(
                        "Duration of the mute. Please input in the style |1W 1D 1H|"
                    )
                    .setRequired( true )
                )
                .addStringOption( ( o ) => o
                    .setName( "custom-reason" )
                    .setDescription(
                        "Please type the custom reason for the mute if you have chosen \"Custom Reason\" under 'Reason'"
                    )
                )
            )
            .addSubcommand( sc => sc
                .setName( 'convert' )
                .setDescription( 'Converts a mute to a temporary mute or vice-versa.' )
                .addStringOption( o => o
                    .setName( 'user-id' )
                    .setDescription( 'UserID of the user to be converted.' )
                    .setRequired( true )
                )
                .addStringOption( o => o
                    .setName( 'reason' )
                    .setDescription( 'Reason for the conversion.' )
                    .setRequired( true )
                )
            )
            .addSubcommand( sc => sc
                .setName( 'undo' )
                .setDescription( 'Unmutes the given user.' )
                .setDescription( 'Unmutes the given user.' )
                .addStringOption( o => o
                    .setName( 'user-id' )
                    .setDescription( 'UserID of the user to be unmutened.' )
                    .setRequired( true )
                )
                .addStringOption( o => o
                    .setName( 'reason' )
                    .setDescription( 'Reason for the unmute (Will appear in Audit Logs)' )
                    .setRequired( true )
                )
            ),
    help: {
        helpName: 'Mute',
        helpDescription: `The mute command has multiple sub commands.\nConvert => Work in Progress. Will allow you to convert mutes into temporary mutes and vice-versa.\nPermanant => Permanantly mutes a user from the server.\nTemporary => Temporarily mutes a user from the server.\nUndo => Unmutes a user using the userID.`,
        helpSyntax: `mute <type-of-action> <arguements>`,
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

        return
    }
}