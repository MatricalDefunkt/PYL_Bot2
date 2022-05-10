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
                iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
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
        const { allCommands } = require( '../../index' );

        const [ ...commands ] = allCommands[ Symbol.iterator ]()
        const responses = [];
        const commandNameValues = []

        commands.forEach( command =>
        {
            responses.push( { name: command[ 0 ], value: command[ 0 ] } )
            commandNameValues.push( command[ 0 ] )
        } )

        const typing = interaction.options.getFocused()

        if ( !typing ) return interaction.respond( responses )

        let foundCommands = commandNameValues.filter( command => command.includes( typing ) )
        const typingResponse = [];

        foundCommands.forEach( foundCommand =>
        {
            typingResponse.push( { name: foundCommand, value: foundCommand } )
        } )
        return interaction.respond( typingResponse )
    }
}