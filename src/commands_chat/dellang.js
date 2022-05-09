const { Message, Client } = require( 'discord.js' );

module.exports = {
  data: {
    name: "dellang",
  },
  help: {
    helpDescription: `Dellang command helps you to delete a language using the channel category name.`,
    helpSyntax: `dellang <name of new language>`,
    helpEmbed: true
  },
  permissions: {
    ownerOnly: false,
    staffOnly: true,
    adminOnly: false,
  },
  /**
   * 
   * @param {Message} msg 
   * @param {Client} client 
   * @param {Array<String>} args 
   * @returns 
   */
  async execute ( msg, client, args )
  {

    const category = await msg.guild.channels.cache.find(
      ( channel ) => channel.name.toLowerCase() === args[ 0 ].toLowerCase() && channel.type === 'GUILD_CATEGORY'
    );
    if ( !category )
      return msg.reply( {
        content: `Language category \`${ args[ 0 ] }\` was not found.`,
      } );

    const filter = ( m ) => m.author === msg.author && m.content === args[ 0 ];
    const reply = await msg.reply( {
      content: `Please repeat the name of the language you want to delete, in under a minute. The same name as before. Incorrect messages will be ignored.`,
    } );

    reply.channel.awaitMessages( {
      filter: filter,
      max: 1,
      time: 60_000,
      errors: [ 'time' ]
    } ).then( captured =>
    {
      captured.first().react( '👌' ).catch( () => { } )
      const channels = client.channels.cache.filter( channel => channel.parentId === category.id )
      channels.forEach( async channel =>
      {
        await channel.delete()
      } )
      category.delete()
    } ).catch( ( reason ) =>
    {
      msg.reply( { content: `You did not reply in time. Please try again.` } ).then( ( message ) =>
      {
        setTimeout( () =>
        {
          msg.delete().catch( () => { } )
          message.delete().catch( () => { } )
          reply.delete().catch( () => { } )
        }, 10_000 );
      } )
    } )

  }
}
