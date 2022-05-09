const fs = require( 'fs' );
const path = require( 'path' );

module.exports = {
    data: {
        name: 'reload',
    },
    help: {
        helpDescription: `Reloads the bot without having to log-in again.`,
        helpSyntax: `reload`,
        helpEmbed: false
    },
    permissions: {
        ownerOnly: true,
        staffOnly: false,
        adminOnly: false,
    },
    async execute ( msg, client, args )
    {
        msg.delete()
        const chatCommandFiles = fs.readdirSync( path.join( __dirname, '/' ) ).filter( file => file.endsWith( '.js' ) )
        chatCommandFiles.forEach( file =>
        {
            delete require.cache[ require.resolve( `./${ file }` ) ]
        } )
        const slashCommandFiles = fs.readdirSync( path.join( __dirname, '/../commands_slash' ) ).filter( file => file.endsWith( '.js' ) )
        slashCommandFiles.forEach( file =>
        {
            delete require.cache[ require.resolve( `../commands_slash/${ file }` ) ]
        } )
        const slashSubCommandFolders = fs.readdirSync( path.join( __dirname, '/../commands_slash/commands_slash_sub' ) )
        slashSubCommandFolders.forEach( folder =>
        {
            const slashSubCommandFiles = fs.readdirSync( path.join( __dirname, `/../commands_slash/commands_slash_sub/${ folder }` ) ).filter( file => file.endsWith( '.js' ) )
            slashSubCommandFiles.forEach( file =>
            {
                delete require.cache[ require.resolve( `../commands_slash/commands_slash_sub/${folder}/${ file }` ) ]
            } )
        } )
        const eventFiles = fs.readdirSync( path.join( __dirname, '/../events' ) ).filter( file => file.endsWith( '.js' ) )
        eventFiles.forEach( file =>
        {
            delete require.cache[ require.resolve( `../events/${ file }` ) ]
        } )
        const utilFiles = fs.readdirSync( path.join( __dirname, '/../utils' ) ).filter( file => file.endsWith( '.js' ) )
        utilFiles.forEach( file =>
        {
            delete require.cache[ require.resolve( `../utils/${ file }` ) ]
        } )
    }
}