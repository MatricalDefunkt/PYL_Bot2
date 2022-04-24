const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed } = require( 'discord.js' )
const { rules } = require( '../rules.json' )

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'unban' )
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
            ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of Unban" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'Unban' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /unban <user-id> <reason>\`\`\`\n\`\`\`\nUse:\nThe unban command unbans the provided user, while logging the reason in the audit logs.\`\`\``
        ),
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( interaction, client )
    {

        await interaction.deferReply( { ephemeral: true } )

        const unbanId = interaction.options.getString( 'user-id' )
        if ( interaction.options.getString( 'user-id' ).length != 18 ) return interaction.editReply( { content: `Please enter a valid user ID` } )
        const reason = interaction.options.getString( 'reason' )

        interaction.guild.bans.fetch( unbanId ).then( unbanUser =>
        {
            interaction.editReply( { content: `Unbanning <@${ unbanId }>` } )
            interaction.guild.bans.remove( unbanId, `${ interaction.user.tag } || ${ reason }` ).then( ( unbannedUser ) =>
            {
                interaction.editReply( { content: `Unbanned ${ unbannedUser }.` } )

            } ).catch( ( err ) =>
            {
                console.error( err );
                interaction.editReply( { content: `There was an error, please contact Matrical ASAP.` } )

            } );

        } ).catch( ( err ) =>
        {

            if ( err.code === 10026 ) return interaction.editReply( { content: `<@${ unbanId }> has not been banned.` } )
            interaction.editReply( { content: `There was an error. Please contact Matrical ASAP.` } )
            console.error( err );

        } );
    }
}