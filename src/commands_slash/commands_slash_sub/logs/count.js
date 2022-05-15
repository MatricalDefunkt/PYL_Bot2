const { Client, CommandInteraction, MessageEmbed } = require( 'discord.js' );
const { Infractions } = require( '../../../database/database' );

module.exports = {
    data: {
        name: 'count',
        parent: 'logs'
    },
    /**
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
    {
        const target = interaction.options.getUser( 'target' );

        const note = await Infractions.count( { where: { targetID: target.id, type: 'Note' } } )
        const ban = await Infractions.count( { where: { targetID: target.id, type: 'Ban' } } )
        const tempBan = await Infractions.count( { where: { targetID: target.id, type: 'TempBan' } } )
        const convertBan = await Infractions.count( { where: { targetID: target.id, type: 'ConvertBan' } } )
        const mute = await Infractions.count( { where: { targetID: target.id, type: 'Mute' } } )
        const tempMute = await Infractions.count( { where: { targetID: target.id, type: 'TempMute' } } )
        const warn = await Infractions.count( { where: { targetID: target.id, type: 'Warn' } } )
        const kick = await Infractions.count( { where: { targetID: target.id, type: 'Kick' } } )
        const unban = await Infractions.count( { where: { targetID: target.id, type: 'Unban' } } )
        const unmute = await Infractions.count( { where: { targetID: tagrget.id, type: 'UnMute' } } )

        const messageBuilder = [
            { name: 'Notes:', value: `${ note }`, inline: true }, { name: 'Warns:', value: `${ warn }`, inline: true }, { name: 'Temp Mutes:', value: `${ tempMute }`, inline: true },
            { name: 'Mutes:', value: `${ mute }`, inline: true }, { name: 'Kicks', value: `${ kick }`, inline: true }, { name: 'Temp Bans:', value: `${ tempBan }`, inline: true },
            { name: 'Converted Bans:', value: `${ unban }`, inline: true }, { name: 'Bans:', value: `${ ban }`, inline: true }, { name: 'Unmutes', value: `${ unmute }`, inline: true },
            { name: 'Unbans:', value: `${ unban }`, inline: true } ]

        const embed = new MessageEmbed()
            .setAuthor( { name: interaction.user.tag, iconURL: interaction.user.avatarURL() } )
            .addFields( messageBuilder )
            .setColor( ( ban > 0 ) ? 'RED' : 'YELLOW' )

        interaction.editReply( { embeds: [ embed ] } )

    }
}