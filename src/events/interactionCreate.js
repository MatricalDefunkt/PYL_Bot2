const { CommandInteraction, ButtonInteraction, SelectMenuInteraction, AutocompleteInteraction } = require( "discord.js" )

module.exports = {
    name: 'interactionCreate',
    /**
     * 
     * @param {Client} client The bot client.
     * @param {CommandInteraction | ButtonInteraction | SelectMenuInteraction | AutocompleteInteraction} interaction The interaction recieved by the end-point.
     * @returns 
     */
    async handle ( client, interaction )
    {
        if ( !interaction.guild ) { return };
        if ( interaction.isCommand() )
        {
            const command = client.slashCommands.get( interaction.commandName )

            if ( !command ) { return } else
            {

                if ( command.permissions.ownerOnly === true && !interaction.user.id == '714473790939332679' ) { return interaction.reply( { content: `Missing permissions.`, ephemeral: true } ) }

                if ( command.permissions.staffOnly === true && !interaction.member._roles.includes( '963537947255255092' ) ) { return interaction.reply( { content: `Missing permissions.`, ephemeral: true } ) }

                if ( command.permissions.adminOnly === true && !interaction.member._roles.includes( '963537994596364288' ) ) { return interaction.reply( { content: `Missing permissions.`, ephemeral: true } ) }

            }

            try
            {

                command.execute( interaction, client )

            } catch ( error )
            {

                console.error( error );

                interaction.channel.send( { content: 'There was an error. Please contact Matrical ASAP', ephemeral: true } )

            }
        }
        if ( interaction.isAutocomplete() )
        {
            const autoCompleteCommand = client.slashCommands.get( interaction.commandName )
            autoCompleteCommand.respond( interaction, client )
        }
    }
}