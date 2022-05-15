const { Client, CommandInteraction, MessageEmbed, MessageActionRow, MessageButton } = require( 'discord.js' );
const Infraction = require( '../../../utils/Infraction.js' );
const { rules } = require( '../../../utils/rules.json' );

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @param {Infraction} infraction 
 * @param {Boolean} message
 */
const finalReply = async function ( client, interaction, infraction, message )
{
    const dbcaseId = infraction.mute.getDataValue( 'caseID' );
    const dbtype = infraction.mute.getDataValue( 'type' );
    const dbtarget = `<@${ infraction.mute.getDataValue( 'targetID' ) }>`;
    const dbmod = `<@${ infraction.mute.getDataValue( 'modID' ) }>`;
    const dbreason = infraction.mute.getDataValue( 'reason' );
    const dbtime = `<t:${ Math.trunc( Date.parse( infraction.mute.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;

    const embed = new MessageEmbed()
        .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
        .setColor( 'YELLOW' )
        .setDescription( `**Case ID -** ${ dbcaseId }\n**Type -** ${ dbtype }\n**Target -** ${ dbtarget }\n**Moderator -** ${ dbmod }\n**Reason -** ${ dbreason }\n**Time -** ${ dbtime }` )
        .setFooter( { iconURL: interaction.user.avatarURL(), text: `${ interaction.user.tag }${ ( message ) ? `` : ` || Did not recieve DM.` }` } )
        .setTimestamp()
    await interaction.editReply( { embeds: [ embed ] } )
    return
}

module.exports = {
    data: {
        name: 'permanant',
        parent: 'mute'
    },
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     * @returns {Promise<void>}
     */
    async execute ( client, interaction )
    {

        const mute = interaction.options.getMember( 'user' );
        let _reason = interaction.options.getInteger( 'reason' );

        if ( !mute ) return interaction.editReply( { content: `The person you want to ban is not a member of this discord server.` } )

        if ( mute.id == interaction.user.id ) return interaction.editReply( { content: `Okay, you have been muted. Don't you speak anymore 🤫` } )

        /**
         * 
         * @param {Number} reasonID 
         * @returns { { id: Number, rule: String, reason: String } } Found rule and reason
         */
        const getRule = ( reasonID ) =>
        {
            return rules.find( rule => rule.id == reasonID );
        }

        let reason;

        if ( _reason == 0 )
        {
            reason = {
                id: 0,
                rule: interaction.options.getString( 'custom-reason' ),
                reason: interaction.options.getString( 'custom-reason' )
            }
            if ( !reason.rule )
            {
                reason = { id: 0, rule: 'None provided.', reason: 'None provided.' };
            }

        } else
        {
            reason = getRule( _reason )
        }

        if ( mute.roles.cache.has( '974245786781102081' ) )
        {
            const row = new MessageActionRow()
                .addComponents( [
                    new MessageButton()
                        .setCustomId( 'yesadd' )
                        .setEmoji( '✅' )
                        .setStyle( 'SECONDARY' ),
                    new MessageButton()
                        .setCustomId( 'nocancel' )
                        .setEmoji( '❎' )
                        .setStyle( 'SECONDARY' )
                ] )
            const disabledRow = new MessageActionRow()
                .addComponents( [
                    new MessageButton()
                        .setCustomId( 'yesadd' )
                        .setEmoji( '✅' )
                        .setStyle( 'SECONDARY' )
                        .setDisabled( true ),
                    new MessageButton()
                        .setCustomId( 'nocancel' )
                        .setEmoji( '❎' )
                        .setStyle( 'SECONDARY' )
                        .setDisabled( true )
                ] )
            const reply = await interaction.editReply( { content: `<@${ mute.id }> already has the muted role. Do you want to still store this infraction?`, components: [ row ] } )
            reply.awaitMessageComponent( { time: 120_000, componentType: "BUTTON" } )
                .then( async ( collected ) =>
                {
                    if ( collected.customId === 'yesadd' )
                    {
                        const infraction = new Infraction()
                        await infraction.addMute( interaction.user.id, mute.id, reason.reason )
                        await collected.update( { content: `Done!`, components: [ disabledRow ] } )
                        const message = true
                        await finalReply( client, interaction, infraction, message )
                        return
                    } else
                    {
                        await collected.update( { content: `Okay, cancelled.`, components: [ disabledRow ] } )
                        return
                    }
                } )
                .catch( async ( err ) =>
                {
                    console.error( err )
                    return interaction.editReply( { content: `You did not click a button in time. No action was taken.`, components: [ disabledRow ] } )
                } )
            return
        } else
        {
            const infraction = new Infraction()

            mute.roles.add( '974245786781102081', `${ interaction.user.tag } || ${ reason.reason }` )
                .then( async ( result ) =>
                {
                    await infraction.addMute( interaction.user.id, mute.id, reason.reason )

                    const dmChannel = await mute.createDM( true )
                    dmChannel.send( {
                        content: `Message from Practice Your Language:`, embeds: [
                            new MessageEmbed()
                                .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL( { size: 512 } ) } )
                                .setColor( 'RED' )
                                .setDescription( 'A message from PYL staff:' )
                                .addField( 'Message:', 'You have been muted in PYL for breaking (a) server rule(s)' )
                                .addField( 'Rule:', reason.rule )
                                .addField( 'Dispute:', 'You may dispute this mute, if you so wish, in <#945355751260557396>' )
                        ]
                    } ).then( async () =>
                    {
                        const message = true
                        return finalReply( client, interaction, infraction, message )

                    } ).catch( ( e ) =>
                    {
                        if ( e.code === 50007 )
                        {
                            interaction.editReply( { content: `Cannot send messages to ${ mute }` } )
                                .then( async () =>
                                {
                                    const message = false
                                    return finalReply( client, interaction, infraction, message )
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
                            interaction.editReply( { content: `There was an error. Please contact Matrical ASAP.` } )
                        }
                    } )

                } ).catch( ( err ) =>
                {
                    console.error( err )
                    interaction.editReply( { content: `Could not add muted role to user. Please contact Matrical ASAP and check permissions.` } )
                } );
        }
    }
}
