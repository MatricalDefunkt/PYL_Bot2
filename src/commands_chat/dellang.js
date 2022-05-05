const { MessageEmbed, MessageCollector } = require( 'discord.js' );

module.exports = {
  data: {
    name: "dellang",
  },
  permissions: {
    ownerOnly: false,
    staffOnly: true,
    adminOnly: false,
  },
  async execute ( msg, client, args )
  {

    const prefix = client.prefixes.get( 'command' )

    const helpEmbed = new MessageEmbed()
      .setTitle( "Use of NewLang" )
      .setAuthor( {
        name: "PYL Bot#9640",
        iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
      } )
      .setColor( "GREEN" )
      .setDescription(
        `Syntax and use of 'newlang' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   ${ prefix }newlang <name of new language>\`\`\`\n\`\`\`\nUse:\nNewLang helps in creating a new language category by making a new category, general chat, no-speaking text, and voice channel.\nOnce you've run the first command, that is !!newlang <name of language>, you will be asked for 3 inputs, namely the names of the three channels.\`\`\``
      )

    if ( !args[ 0 ] )
    {
      return msg.reply( { embeds: [ helpEmbed ] } ).then( msg => setTimeout( () =>
      {
        try
        {
          msg.delete()
        } catch ( err )
        {
          console.error( err )
        }
      }, 30000 ) )
    }

    const category = await msg.guild.channels.cache.find(
      ( channel ) => channel.name.toLowerCase() === args[ 0 ].toLowerCase() && channel.type === 'GUILD_CATEGORY'
    );
    if ( !category )
      return msg.reply( {
        content: `Language category \`${ args[ 0 ] }\` was not found.`,
      } );

    const filter = ( m ) => m.author === msg.author && m.content === args[ 0 ];
    const reply = await msg.reply( {
      content: `Please repeat the name of the language you want to delete. The same name as before. Incorrect messages will be ignored.`,
    } );

    const collector = new MessageCollector( msg.channel, {
      time: 10000,
      filter: filter,
    } );

    collector.on( "collect", async ( collected ) =>
    {
      collected.react( "👌" );
      const channels = client.channels.cache.filter(
        ( channel ) => channel.parentId === category.id
      );

      try
      {
        channels.forEach( ( channel ) =>
        {
          channel.delete();
        } );
      } finally
      {
        category.delete();
        collector.stop( `Successful` );
      }
    } );
    collector.on( 'end', async ( collected, reason ) =>
    {
      if ( reason != `Successful` )
      {
        reply.edit( { content: `There was an error, please contact Matrical ASAP.` } )
        collected.delete()
      } else
      {
        reply.edit( { content: `Deletion of \`${ args[ 0 ] }\` language category was successfully completed.` } )
      }
    } )
  }
}
