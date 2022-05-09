module.exports = {
  data: {
    name: "ping",
  },
  help: {
    helpDescription: `The ping command replies with the roundtrip latency of the bot. Meaning, the time it takes for a bot to recieve a message subtracted from the time it takes to send a message, from, and to Discord.`,
    helpSyntax: `ping`,
    helpEmbed: false
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
