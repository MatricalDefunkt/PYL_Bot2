const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction, Collection } = require( 'discord.js' );
const path = require('path');
const fs = require('fs');

const subCommands = new Collection()
const subCommandFiles = fs.readdirSync( path.join( __dirname, './commands_slash_sub/ban' ) ).filter( file => file.endsWith( '.js' ) );
subCommandFiles.forEach( file =>
{
    const subCommand = require( `./commands_slash_sub/ban/${ file }` );
    subCommands.set( subCommand.data.name, subCommand );
} )

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'ban' )
            .setDescription( 'Bans the given user.' )
            .addSubcommand( sc => sc
                .setName( 'permanant' )
                .setDescription( 'Bans a user, permanantly.' )
                .addUserOption( o => o
                    .setName( 'user' )
                    .setDescription( 'User to ban' )
                    .setRequired( true )
                )
                .addIntegerOption( o => o
                    .setName( 'reason' )
                    .setDescription( 'Reason for the ban (Will appear in Audit Logs)' )
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
                .addIntegerOption( o => o
                    .setName( 'msg-history' )
                    .setDescription( 'Delete the message history for the given time' )
                    .addChoices( [
                        [ 'Don\'t delete', 0 ],
                        [ '1 Day / 24 Hours', 1 ],
                        [ '2 Days / 48 Hours', 2 ],
                        [ '3 Days / 72 Hours', 3 ],
                        [ '4 Days / 96 Hours', 4 ],
                        [ '5 Days / 120 Hours', 5 ],
                        [ '6 Days / 144 Hours', 6 ],
                        [ '7 Days / 168 Hours', 7 ]
                    ] )
                    .setRequired( true )
                )
                .addBooleanOption( o => o
                    .setName( 'disputable' )
                    .setDescription( 'Whether the ban is disputable or not.' )
                )
                .addStringOption( o => o
                    .setName( 'custom-reason' )
                    .setDescription( 'Please type the custom reason for the ban if you have chosen "Custom Reason" under \'Reason\'' )
                )
            )
            .addSubcommand( sc => sc
                .setName( 'temporary' )
                .setDescription( 'Bans a user, temporarily.' )
                .addUserOption( ( o ) =>
                    o.setName( "user" ).setDescription( "User to ban" ).setRequired( true )
                )
                .addIntegerOption( ( o ) => o
                        .setName( "reason" )
                        .setDescription(
                            "Reason for the ban (Will appear in Audit Logs)"
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
                .addIntegerOption( ( o ) => o
                        .setName( "msg-history" )
                        .setDescription( "Delete the message history for the given time" )
                        .addChoices( [
                            [ "Don't delete", 0 ],
                            [ "1 Day / 24 Hours", 1 ],
                            [ "2 Days / 48 Hours", 2 ],
                            [ "3 Days / 72 Hours", 3 ],
                            [ "4 Days / 96 Hours", 4 ],
                            [ "5 Days / 120 Hours", 5 ],
                            [ "6 Days / 144 Hours", 6 ],
                            [ "7 Days / 168 Hours", 7 ],
                        ] )
                        .setRequired( true )
                )
                .addStringOption( ( o ) => o
                        .setName( "duration" )
                        .setDescription(
                            "Duration of the ban. Please input in the style |1W 1D 1H|"
                        )
                        .setRequired( true )
                )
                .addBooleanOption( ( o ) => o
                        .setName( "disputable" )
                        .setDescription( "Whether the ban is disputable or not." )
                )
                .addStringOption( ( o ) => o
                        .setName( "custom-reason" )
                        .setDescription(
                            "Please type the custom reason for the ban if you have chosen \"Custom Reason\" under 'Reason'"
                        )
                )
            )
            .addSubcommand(sc => sc
                .setName('convert')
                .setDescription('Converts a ban to a temporary ban or vice-versa.')
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
            .addSubcommand(sc => sc
                .setName('undo')
                .setDescription('Unbans the given user.')
                .setDescription( 'Unbans the given user.' )
                .addStringOption( o => o
                    .setName( 'user-id' )
                    .setDescription( 'UserID of the user to be unbanned.' )
                    .setRequired( true )
                )
                .addStringOption( o => o
                    .setName( 'reason' )
                    .setDescription( 'Reason for the unban (Will appear in Audit Logs)' )
                    .setRequired( true )
                )
            ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of Ban" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'Ban' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /ban <user> <reason> <days-of-messages-to-delete> [custom-reason] [disputable || Default: true]\`\`\`\n\`\`\`\nUse:\nThe ban command bans the provided user, sending them a DM with the reason, while logging the same reason in the audit logs. If applicable, the message will contain an invite to PYL Ban Appeals.\`\`\``
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
        
        return
    }
}