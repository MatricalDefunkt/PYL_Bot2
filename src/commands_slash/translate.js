const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction, AutocompleteInteraction, MessageActionRow, MessageButton } = require( 'discord.js' );
const languageResponse = require( '../utils/languagecodes.json' );
const translate = require( '@vitalets/google-translate-api' );

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'translate' )
            .setDescription( 'Translate... What else' )
            .addStringOption( o => o
                .setName( 'text' )
                .setDescription( 'The text you would like to translate' )
                .setRequired( true )
            )
            .addStringOption( o => o
                .setName( 'language-to' )
                .setDescription( 'The language you would like to translate to.' )
                .setAutocomplete( true )
                .setRequired( true )
            )
            .addStringOption( o => o
                .setName( 'language-from' )
                .setDescription( 'The language you would like to translate from. Will use detect-language by default.' )
                .setAutocomplete( true )
            ),
    help: {
        helpName: 'Translate',
        helpDescription: `Translate helps you by translating some text from one language into another, autocorrecting as well as giving you text for pronounciation (if applicable).`,
        helpSyntax: `translate <text> <language-to-translate-into> [language-to-translate-from]`,
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
        await interaction.deferReply()

        const text = interaction.options.getString( 'text' )
        const langToIso = interaction.options.getString( 'language-to' )
        const langFromIso = interaction.options.getString( 'language-from' )

        try
        {
            const result = await translate( text, { to: langToIso, from: langFromIso } )

            const fromName = languageResponse.find( lang => lang.value === ( ( langFromIso ) ? langFromIso : result.from.language.iso ) ).name
            const toName = languageResponse.find( lang => lang.value === langToIso ).name

            const embed = new MessageEmbed()
                .setFooter( { text: interaction.user.tag, iconURL: interaction.user.avatarURL() } )
                .setTitle( `Translation ( ${ fromName } => ${ toName } )` )
                .addField( 'Translation:', result.text )
                .addField( 'Original:', text )
                .setColor( 'RANDOM' )
                .setTimestamp()

            if ( result.from.text.autoCorrected === true ) embed.addField( 'Autocorrected:', result.from.text.value )
            if ( result.pronunciation ) embed.addField( 'Pronounciation:', result.pronunciation )

            if ( result.from.text.didYouMean === true )
            {
                const row = new MessageActionRow()
                    .addComponents( [
                        new MessageButton()
                            .setCustomId( 'yesimeant' )
                            .setLabel( 'Yes' )
                            .setStyle( "PRIMARY" ),
                        new MessageButton()
                            .setCustomId( 'noididnt' )
                            .setLabel( 'No' )
                            .setStyle( "SECONDARY" )
                    ] )

                const filter = ( button ) => button.user.id === interaction.user.id
                const reply = await interaction.editReply( { content: `Did you mean:\n${ result.from.text.value }`, components: [ row ] } )
                reply.awaitMessageComponent( {
                    filter,
                    time: 120_000,
                    componentType: "BUTTON"
                } ).then( async ( button ) =>
                {
                    if ( button.customId === 'yesimeant' )
                    {
                        const didYouMeanText = result.from.text.value.replaceAll( '[', '' ).replaceAll( ']', '' )
                        const newResult = await translate( didYouMeanText, { to: langToIso, from: langFromIso } )
                        const embed = new MessageEmbed()
                            .setFooter( { text: interaction.user.tag, iconURL: interaction.user.avatarURL() } )
                            .setTitle( `Translation ( ${ fromName } => ${ toName } )` )
                            .addField( 'Translation:', newResult.text )
                            .addField( 'Did You Mean:', didYouMeanText )
                            .addField( 'Original:', text )
                            .setColor( 'RANDOM' )
                            .setTimestamp()
                        return button.update( { content: `Updated!`, components: [], embeds: [ embed ] } )

                    } else
                    {
                        return button.update( { content: `Unchanged!`, components: [], embeds: [ embed ] } )
                    }
                } ).catch( ( err ) =>
                {
                    console.error( err )
                    return interaction.editReply( { components: [], content: `Either you did not click on time, or something went wrong.`, embeds: [ embed ] } )
                } );
            } else
            {
                return interaction.editReply( { embeds: [ embed ] } )
            }
        } catch ( error )
        {
            console.log( error.error )
        }
    },
    /**
     * 
     * @param {AutocompleteInteraction} interaction 
     * @param {Client} client 
     * @returns {Promise<void>}
     */
    async respond ( interaction, client )
    {
        try
        {

            const typing = interaction.options.getFocused()

            if ( !typing ) return interaction.respond( ( languageResponse.length > 25 ) ? languageResponse.slice( 0, 25 ) : languageResponse )

            const foundLanaguageResponse = languageResponse.filter( lang => lang.name.toLowerCase().includes( typing.toLowerCase() ) )

            await interaction.respond( ( foundLanaguageResponse.length > 25 ) ? foundLanaguageResponse.slice( 0, 25 ) : foundLanaguageResponse )

        } catch ( error )
        {

            if ( error.name === "Unknown interaction" )
            {
                const testGuild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } );
                const errChannel = await testGuild.channels.fetch( '948089637774188564', { force: false, cache: true } );
                errChannel.send( { content: `<@714473790939332679>, client is slow to respond to autocomplete interactions.` } )
            } else
            {
                console.error( error );
            }

        }

    }
}