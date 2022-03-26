module.exports = {
  data: {
    name: "ping",
    ownerOnly: false,
    staffOnly: false,
    adminOnly: false,
  },
  async execute(msg, client, args) {
    const sent = await msg.reply({ content: "Pinging..." });
    sent.edit(
      `Roundtrip latency is ${
        sent.createdTimestamp - msg.createdTimestamp
      }ms, <@${sent.mentions.repliedUser.id}>`
    );
  }
}
