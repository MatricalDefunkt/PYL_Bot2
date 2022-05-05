const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { Client, CommandInteraction } = require( 'discord.js' );
const fs = require( 'fs' );
const path = require( 'path' );
const { Prefix } = require( '../database/database' );

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'prefix' )
            .setDescription( 'Changes the bot prefix for text commands.' )
            .addStringOption( o => o
                .setName( 'type' )
                .setDescription( 'Type of the prefix you want to change.' )
                .addChoices(
                    [
                        [ 'Command', 'command' ],
                        [ 'Tag', 'tag' ]
                    ]
                )
                .setRequired( true )
            )
            .addStringOption( o => o
                .setName( 'action' )
                .setDescription( 'Whether you would like to get the prefix, or you would like to set the prefix.' )
                .addChoices(
                    [
                        [ 'Get', 'get' ],
                        [ 'Set', 'set' ]
                    ]
                )
                .setRequired( true )
            )
            .addStringOption( o => o
                .setName( 'prefix' )
                .setDescription( 'The prefix to set to, if you wish to change it.' )
            ),
    permissions: {
        ownerOnly: false,
        staffOnly: false,
        adminOnly: true,
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

        const prefix = interaction.options.getString( 'prefix' )
        const action = interaction.options.getString( 'action' )
        const type = interaction.options.getString( 'type' )

        if ( action === 'get' )
        {
            return interaction.editReply( { content: `The \`${ type }\` prefix for the bot is \`${ client.prefixes.get( type ) }\`.` } )
        }
        if ( action === 'set' )
        {
            if ( !prefix ) return interaction.editReply( { content: 'Please provide the prefix to change to!' } )
            if ( prefix.length >= 3 ) return interaction.reply( { content: `Prefix length can not be more than \`3\`` } )
            await interaction.editReply( { content: `Changing prefix now...` } )

            const [ existingCommandPrefix, existingTagPrefix ] = client.prefixes[ Symbol.iterator ]()

            if ( ( type == existingCommandPrefix[ 0 ] && prefix == existingCommandPrefix[ 1 ] ) || ( type == existingTagPrefix[ 0 ] && prefix == existingTagPrefix[ 1 ] ) ) return interaction.editReply( { content: `The prefix for \`${ type }\` was already the same as \`${ prefix }\`` } )

            const files = fs.readdirSync( path.join( __dirname, '/../commands_chat' ) )
            files.forEach( file =>
            {
                delete require.cache[ require.resolve( `../commands_chat/${ file }` ) ]
            } )
            delete require.cache[ require.resolve( '../events/messageCreateCommand.js' ), require.resolve( '../events/messageCreateTag.js' ) ]
            try
            {
                await Prefix.update( { prefix: prefix }, { where: { type: type } } ).then( () =>
                {
                    client.prefixes.delete( type )
                    client.prefixes.set( type, prefix )
                } )
                await interaction.editReply( { content: `The \`${ type }\` prefix has been changed to \`${ prefix }\`.` } )
            } catch ( e )
            {
                if ( e.name === 'SequelizeUniqueConstraintError' )
                {
                    return interaction.editReply( { content: `Prefixes for \`command\` and \`tag\` cannot be the same.` } )
                } else
                {
                    console.error( e )
                    return interaction.editReply( { content: `There was an error. Please contact Matrical ASAP.` } )
                }
            }
        }
        return
    }
}