const { Client, CommandInteraction, MessageEmbed } = require( 'discord.js' );
const Infraction = require( '../../../utils/Infraction.js' );
const { rules } = require( '../../../utils/rules.json' );

module.exports = {
    data: {
        name: 'permanant',
        parent: 'ban'
    },
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
    {

        const bannee = interaction.options.getMember( 'user' );
        let _reason = interaction.options.getInteger( 'reason' );
        const time = interaction.options.getInteger( 'msg-history' );

        if ( !bannee ) return interaction.editReply( { content: `The person you want to ban is not a member of this discord server.` } )

        if ( bannee.bannable == false )
        {
            return interaction.editReply( { content: `I cannot ban ${ bannee }. They're too powerful 🤯!!` } )
        } else if ( interaction.member === bannee )
        {
            return interaction.editReply( { content: `Okay, you have been banned. Now move on.` } )
        }

        const getRule = ( reasonID ) =>
        {
            return rules.find( rule => rule.id == reasonID );
        }

        let reason;

        if ( _reason == 0 )
        {

            reason = { id: 0, rule: interaction.options.getString( 'custom-reason' ), reason: interaction.options.getString( 'custom-reason' ) }
            if ( !reason.rule )
            {
                reason = { id: 0, rule: 'None provided.', reason: 'None provided.' };
            }
            return reason;
        } else
        {

            reason = getRule( _reason )

        }

        const disputable = interaction.options.getBoolean( 'disputable' )
        let disputableReply;

        if ( disputable === false )
        {
            disputableReply = `Since this ban has been set as non-disputable, you may not dispute it, as it is now final.`
        }
        else 
        {
            disputableReply = `Since this ban has been set as disputable, you may join [this](https://discord.gg/UEwR4CUrug) server and dispute the ban there.`
        }

        try
        {
            const dmChannel = await bannee.createDM( true )
            dmChannel.send( {
                content: `Message from Practice Your Language:`, embeds: [
                    new MessageEmbed()
                        .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL( { size: 512 } ) } )
                        .setColor( 'RED' )
                        .setDescription( 'A message from PYL staff:' )
                        .addField( 'Message:', 'You have been banned from PYL for breaking (a) server rule(s)' )
                        .addField( 'Rule:', reason.rule )
                        .addField( 'Dispute:', disputableReply )

                ]
            } ).then( () =>
            {
                interaction.editReply( { content: `${ bannee } has recieved the ban message.\nBanning now...` } )
                bannee
                    .ban( { days: time, reason: `${ interaction.user.tag } || ${ reason.reason }` } )
                    .then( async () =>
                    {
                        await interaction.editReply( { content: `${ bannee } has been banned.` } )
                        const ban = new Infraction()
                        ban.addBan( interaction.user.id, bannee.id, reason.reason )
                    } )
                    .catch(
                        ( rejectedReason ) =>
                        {
                            interaction.editReply( { content: `Something went wrong. Please contact Matrical ASAP.` } )
                            console.log( rejectedReason )
                        } )
            } )
        } catch ( e )
        {

            if ( e.code === 50007 )
            {
                await interaction.editReply( { content: `Cannot send messages to ${ bannee }\nBanning now...` } )
                await bannee
                    .ban( { days: time, reason: `${ reason.reason }` } )
                    .then( async () =>
                    {
                        await interaction.editReply( { content: `${ bannee } has been banned.` } )
                        const ban = new Infraction()
                        ban.addBan( interaction.user.id, bannee.id, reason.reason )
                    } )
                    .catch(
                        ( rejectedReason ) =>
                        {
                            interaction.editReply( { content: `Something went wrong. Please contact Matrical ASAP.` } )
                            console.log( rejectedReason )
                        } )
            } else
            {
                console.error( e )
            }

        }
    }
}