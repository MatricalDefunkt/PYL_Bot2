const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction } = require( 'discord.js' );

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'slow' )
            .setDescription( 'Sets a channel\'s slow-mode.' )
            .addChannelOption( o => o
                .setName( 'channel' )
                .setDescription( 'The channel you would like slowmode in.' )
                .setRequired( true )
            )
            .addNumberOption( o => o
                .setName( 'time' )
                .setDescription( 'Time to set the delay to:' )
                .setRequired( true )
                .addChoices( [
                    [ "Remove", 0 ],
                    [ "2 Seconds", 2 ],
                    [ "3 Seconds", 3 ],
                    [ "4 Seconds", 4 ],
                    [ "5 Seconds", 5 ],
                    [ "10 Seconds", 10 ],
                    [ "15 Seconds", 15 ]
                ] )
            )
            .addStringOption( o => o
                .setName( 'reason' )
                .setDescription( 'Reason for slow-mode' )
            ),
    help: {
        helpName: 'Slow',
        helpDescription: `Adds slowmode into a channel.`,
        helpSyntax: `slow <channel> <time> [reason]`,
        helpEmbed: false
    },
    permissions: {
        ownerOnly: false,
        staffOnly: false,
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
        await interaction.deferReply( { ephemeral: true } )

        const channel = interaction.options.getChannel( 'channel' )
        const time = interaction.options.getNumber( 'time' )
        const _reason = interaction.options.getString( 'reason' )

        let reason;
        if ( !_reason )
        {
            reason = `${ interaction.user.tag } | None provided.`
        } else
        {
            reason = `${ interaction.user.tag } | ${ reason }`
        }

        if ( channel.type !== "GUILD_PRIVATE_THREAD" || channel.type !== "GUILD_PUBLIC_THREAD" || channel.type !== "GUILD_TEXT" || channel.type !== "GUILD_NEWS" || channel.type !== "GUILD_NEWS_THREAD" )
        {
            return interaction.editReply( { content: `Channel must be of text type to set a slow-mode in it.` } )
        }

        if ( time === 0 )
        {
            channel.setRateLimitPerUser( time, reason ).then( ( channel ) =>
            {
                return interaction.editReply( { content: `Successfully removed slow-mode for ${ channel } with reason:\n${ reason }` } )
            } ).catch( ( err ) =>
            {
                console.error( err );
                return interaction.editReply( { content: `There was an error. Please contact Matrical ASAP.` } )
            } );
        } else
        {
            channel.setRateLimitPerUser( time, reason ).then( ( channel ) =>
            {
                return interaction.editReply( { content: `Successfully set slow-mode of \`${ time }s\` for ${ channel } with reason:\n${ reason }` } )
            } ).catch( ( err ) =>
            {
                console.error( err );
                return interaction.editReply( { content: `There was an error. Please contact Matrical ASAP.` } )
            } );
        }
    }
}