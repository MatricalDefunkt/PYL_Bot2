const { MessageEmbed } = require( 'discord.js' );
require( 'dotenv' ).config()
const errChannelId = process.env.ERRCHANNELID;
const errGuildId = process.env.ERRGUILDID;

module.exports = {
  data: {
    name: "eval",
  },
  help: {
    helpName: 'Evaluate',
    helpDescrtiption: `The eval command accepts input in the form of a string. If the input is in the proper format, it runs the code as if it's javascript.`,
    helpSyntax: `eval <code in javascript>`,
    helpEmbed: true
  },
  permissions: {
    ownerOnly: true,
    staffOnly: false,
    adminOnly: false,
  },
  async execute ( msg, client, args )
  {

    const errGuild = await client.guilds.fetch( `${ errGuildId }` );
    const errChannel = await errGuild.channels.fetch( `${ errChannelId }` );

    if ( msg.author.id != 714473790939332679n ) return;

    try
    {
      const evalCommand = args.join( " " );

      const evalReply = eval( evalCommand );
      if ( evalReply )
      {
        msg.reply( { content: `${ evalReply }` } );
      } else
      {
        msg.reply( { content: `Check console.` } );
      }
    } catch ( error )
    {
      console.error( error );
      errChannel.send( {
        content: `An error was caught: \n\`\`\`js\n${ error.stack }\`\`\``,
      } );
    }
  }
}
