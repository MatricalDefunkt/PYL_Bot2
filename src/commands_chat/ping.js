const { MessageEmbed } = require( "discord.js" );

const helpEmbed = new MessageEmbed()
  .setTitle( "Use of Ping" )
  .setAuthor( {
    name: "PYL Bot#9640",
    iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
  } )
  .setColor( "GREEN" )
  .setDescription(
    `Syntax and use of 'ping' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   !!ping\`\`\`\n\`\`\`\nUse:\nThe ping command replies with the roundtrip latency of the bot. Meaning, the time it takes for a bot to recieve a message subtracted from the time it takes to send a message, from, and to Discord.\`\`\``
)

module.exports = {
  data: {
    name: "ping",
  },
  permissions: {
    ownerOnly: false,
    staffOnly: false,
    adminOnly: false,
  },
  async execute ( msg, client, args )
  {
    const sent = await msg.reply( { content: "Pinging..." } );
    sent.edit(
      `Roundtrip latency is ${ sent.createdTimestamp - msg.createdTimestamp
      }ms.>`
    );
  }
}
