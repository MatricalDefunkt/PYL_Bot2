const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction, AutocompleteInteraction } = require( 'discord.js' );

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'help' )
            .setDescription( 'Stop it. Get some help.' )
            .addStringOption( o => o
                .setName( 'command' )
                .setDescription( 'The command you would like help with.' )
                .setAutocomplete( true )
                .setRequired( true )
            ),
    help: {
        helpName: 'Halp',
        helpDescription: `No. Go. Go get some help. This is not help. WHY oh WHY did you think that this is a good idea??????`,
        helpSyntax: `ban\nIm gonna ban you. :(`,
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

        const { allCommands } = require( '../../index' );
        const [ ...commands ] = allCommands[ Symbol.iterator ]()
        const commandName = interaction.options.getString( 'command' )

        const commandNameValues = []
        commands.forEach( command =>
        {
            commandNameValues.push( command[ 0 ] )
        } )

        if ( !commandNameValues.includes( commandName ) ) return interaction.editReply( { content: `Command with name \`${ commandName }\` does not exist.` } )

        const command = allCommands.get( commandName )
        const prefix = ( command.data.description ) ? '/' : client.prefixes.get( 'command' )

        const helpEmbed = new MessageEmbed()
            .setTitle( `Use of ${ command.data.name }` )
            .setAuthor( {
                name: "PYL Bot#9640",
                iconURL: client.user.avatarURL(),
            } )
            .setColor( "GREEN" )
            .setDescription(
                `Syntax and use of \`${ command.data.name }\` command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`\n${ prefix }${ command.help.helpSyntax }\`\`\`\n\`\`\`\nUse:\n${ command.help.helpDescription }\`\`\``
            )

        return interaction.editReply( { embeds: [ helpEmbed ] } )

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
            const { allCommands } = require( '../../index' );

            const [ ...commands ] = allCommands[ Symbol.iterator ]()
            const responses = [];
            const commandNameValues = []

            commands.forEach( command =>
            {
                responses.push( { name: command[ 1 ].help.helpName, value: command[ 0 ] } )
                commandNameValues.push( command[ 1 ].help.helpName )
            } )

            const autocorrect = require( 'autocorrect' )( { words: commandNameValues } );

            const typing = interaction.options.getFocused()

            if ( !typing ) return interaction.respond( responses )

            let foundCommands = commandNameValues.filter( command => command.includes( typing ) )
            const typingResponse = [];

            foundCommands.forEach( foundCommand =>
            {
                typingResponse.push( { name: foundCommand, value: foundCommand } )
            } )

            if ( !typingResponse[ 0 ] ) return interaction.respond( [ { name: autocorrect( typing ), value: commandNameValues.find( command => command === autocorrect( typing ) ) } ] )

            return interaction.respond( typingResponse )
        } catch ( error )
        {
            if ( error.name === "Unknown interaction" )
            {
                const testGuild = await client.guilds.fetch( { force: false, cache: true, guild: '945355751260557393' } );
                const errChannel = await testGuild.channels.fetch( '948089637774188564', { force: false, cache: true } );
                errChannel.send( { content: `<@714473790939332679>, client is slow to respond to interactions.` } )
            } else
            {
                console.error( error );
            }
        }

    }
}