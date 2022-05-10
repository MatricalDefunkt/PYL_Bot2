const { Client, Message } = require( "discord.js" );

module.exports = {
  data: {
    name: "ping",
  },
  help: {
    helpDescription: `The ping command replies with the roundtrip latency of the , as well as the websocket ping, meaning, the time it takes for a bot to recieve a message subtracted from the time it takes to send a message, from, and to Discord.`,
    helpSyntax: `ping`,
    helpEmbed: false
  },
  permissions: {
    ownerOnly: false,
    staffOnly: false,
    adminOnly: false,
  },
  /**
   * 
   * @param {Message} msg 
   * @param {Client} client 
   * @param {Array<String>} args 
   */
  async execute ( msg, client, args )
  {
    const sent = await msg.reply( { content: "Pinging..." } );
    sent.edit(
      `Roundtrip Latency: ${ sent.createdTimestamp - msg.createdTimestamp}ms.\nWebsocket Ping: ${ client.ws.ping }ms.`
    );
  }
}
