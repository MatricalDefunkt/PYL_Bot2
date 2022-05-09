const { Permissions } = require( "discord.js" );

module.exports = {
  data: {
    name: 'newlang',
  },
  help: {
    helpDescription: `NewLang helps in creating a new language category by making a new category, general chat, no-speaking text, and voice channel.\nOnce you've run the first command, that is !!newlang <name of language>, you will be asked for 3 inputs, namely the names of the three channels.`,
    helpSyntax: `newlang <name of new language>`,
    helpEmbed: true
  },
  permissions: {
    ownerOnly: false,
    staffOnly: true,
    adminOnly: false,
  },
  async execute ( msg, client, args )
  {

    reply = await msg.reply( { content: `Creating...` } );

    const category = await msg.guild.channels.create( `${ args[ 0 ] }`, {
      type: "GUILD_CATEGORY",
    } );

    const filter = ( m ) => m.author === msg.author;
    let channel;
    let noVoice;
    let voice;

    await msg.channel.send( {
      content: `${ msg.author }, please give a name for the general chat in the next minute`,
    } );
    await msg.channel
      .awaitMessages( { filter, max: 1, time: 60000, errors: [ "time" ] } )
      .then( async ( collected ) =>
      {
        channel = await msg.guild.channels.create(
          `${ collected.first().content }`,
          {
            type: "GUILD_TEXT",
            parent: category,
          }
        );
        return channel;
      } )
      .catch( async ( err ) =>
      {
        await msg.reply( { content: `You did not reply in time` } )
        channel = await msg.guild.channels.create(
          `${ args[ 0 ] } general`,
          {
            type: "GUILD_TEXT",
            parent: category,
          }
        );
        return channel;
      } );

    await msg.channel.send( {
      content: `${ msg.author }, please give a name for the no-voice chat in the next minute`,
    } );
    await msg.channel
      .awaitMessages( { filter, max: 1, time: 60000, errors: [ "time" ] } )
      .then( async ( collected ) =>
      {
        noVoice = await msg.guild.channels.create(
          `${ collected.first().content }`,
          {
            type: "GUILD_TEXT",
            parent: category,
          }
        );
        return noVoice;
      } )
      .catch( async ( err ) =>
      {
        await msg.reply( { content: `You did not reply in time` } )
        channel = await msg.guild.channels.create(
          `${ args[ 0 ] } No-voice`,
          {
            type: "GUILD_TEXT",
            parent: category,
          }
        );
        return channel;
      } );

    await msg.channel.send( {
      content: `${ msg.author }, please give a name for the voice chat in the next minute`,
    } );
    await msg.channel
      .awaitMessages( { filter, max: 1, time: 60000, errors: [ "time" ] } )
      .then( async ( collected ) =>
      {
        voice = await msg.guild.channels.create( `${ collected.first().content }`, {
          type: "GUILD_VOICE",
          parent: category,
        } );
        return voice;
      } )
      .catch( async ( err ) =>
      {
        await msg.reply( { content: `You did not reply in time` } )
        channel = await msg.guild.channels.create(
          `${ args[ 0 ] } Voice`,
          {
            type: "GUILD_TEXT",
            parent: category,
          }
        );
        return channel;
      } );

    await category.permissionOverwrites.set( [
      {
        id: msg.guild.id,
        deny: [ Permissions.FLAGS.VIEW_CHANNEL ],
      },
    ] );

    channel.lockPermissions();
    noVoice.lockPermissions();
    voice.lockPermissions();
    reply.edit( { content: "Done!" } );

    setImmediate( ( msg ) =>
    {
      setTimeout( function ()
      {
        msg.channel.bulkDelete( 6 );
      }, 1000 );
    }, msg );
  }
}
