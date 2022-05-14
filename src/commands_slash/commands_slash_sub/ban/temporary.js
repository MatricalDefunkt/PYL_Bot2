const { Client, CommandInteraction, MessageEmbed } = require( 'discord.js' );
const { tempBans: tempInfractions } = require( '../../../database/database' );
const Infraction = require( '../../../utils/Infraction.js' );
const { rules } = require( '../../../utils/rules.json' );

module.exports = {
    data: {
        name: 'temporary',
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

        const bannee = interaction.options.getMember( "user" );
        let _reason = interaction.options.getInteger( "reason" );
        const time = interaction.options.getInteger( "msg-history" );
        const _duration = interaction.options.getString( "duration" );

        if ( !bannee ) return interaction.editReply( { content: `The person you want to ban is not a member of this discord server.` } )

        if ( bannee.bannable == false )
        {
            return interaction.editReply( {
                content: `I cannot ban ${ bannee }. They're too powerful 🤯!!`,
            } );
        } else if ( interaction.member === bannee )
        {
            return interaction.editReply( {
                content: `Okay, you have been banned. Now move on.`,
            } );
        }

        const getRule = ( reasonID ) =>
        {
            return rules.find( ( rule ) => rule.id == reasonID );
        };

        let reason;

        if ( _reason == 0 )
        {
            reason = {
                id: 0,
                rule: interaction.options.getString( "custom-reason" ),
                reason: interaction.options.getString( "custom-reason" )
            };
            if ( !reason )
            {
                reason = {
                    id: 0,
                    rule: "None provided.",
                    reason: "None provided.",
                };
            }
        } else
        {
            reason = getRule( _reason );
        }

        const disputable = interaction.options.getBoolean( "disputable" );
        let disputableReply;

        if ( disputable === false )
        {
            disputableReply = `Since this ban has been set as non-disputable, you may not dispute it, as it is now final.`;
        } else
        {
            disputableReply = `Since this ban has been set as disputable, you may join [this](https://discord.gg/UEwR4CUrug) server and dispute the ban there.`;
        }

        let durationTimestamp;

        try
        {
            const timeArgs = _duration.toLowerCase().split( " " );
            let weeks = timeArgs.find( ( arg ) => arg.includes( "w" ) );
            let days = timeArgs.find( ( arg ) => arg.includes( "d" ) );
            let hours = timeArgs.find( ( arg ) => arg.includes( "h" ) );

            if ( !weeks && !days && !hours )
                return interaction.editReply( {
                    content: `Invalid arguements for \`duration\`. Please input duration in the format of xW xD xH.`,
                } );

            if ( !weeks ) { weeks = "0w" };
            if ( !days ) { days = "0d" };
            if ( !hours ) { hours = "0h" };

            const duration = {
                weeks: parseInt( weeks.replace( "w", "" ) ),
                days: parseInt( days.replace( "d", "" ) ),
                hours: parseInt( hours.replace( "h", "" ) ),
            };

            if ( ( duration.days < 1 && duration.weeks < 1 ) && duration.hours < 1 ) return interaction.editReply( { content: `Minimum duration of a ban is 1H, sadly.` } )

            durationTimestamp = Math.trunc( interaction.createdTimestamp / 1000 ) + (
                ( duration.weeks * 604800 ) +
                ( duration.days * 86400 ) +
                ( duration.hours * 3600 )
            )

            await tempInfractions
                .create( {
                    userID: bannee.id,
                    finishTimeStamp: durationTimestamp,
                    modID: interaction.user.id,
                    reason: reason.rule,
                    guildID: interaction.guild.id
                } )
                .then( () =>
                {
                    interaction.editReply( {
                        content: `Data has been saved, continuing now...`,
                    } );
                } )
                .catch( ( err ) =>
                {
                    interaction.editReply( {
                        content: `There was an error. Please contact Matrical ASAP.`,
                    } );
                    console.error( err );
                    return;
                } );

        } catch ( error )
        {
            console.error( error );
            interaction.editReply( {
                content: `There was an error. Please contact Matrical ASAP.`,
            } );
            if ( error ) return;
        }

        try
        {
            const dmChannel = await bannee.createDM( true );
            dmChannel
                .send( {
                    content: `Message from Practice Your Language:`,
                    embeds: [
                        new MessageEmbed()
                            .setAuthor( {
                                name: client.user.tag,
                                iconURL: client.user.avatarURL( { size: 512 } ),
                            } )
                            .setColor( "RED" )
                            .setDescription( "A message from PYL staff:" )
                            .addField(
                                "Message:",
                                "You have been `TEMPORARILY` banned from PYL for breaking (a) server rule(s)\nThe ban will expire in"
                            )
                            .addField( "Rule:", reason.rule )
                            .addField( "Dispute:", disputableReply )
                            .addField( 'Duration:', `You will be unbanned in <t:${ durationTimestamp }:R>` ),
                    ],
                } )
                .then( () =>
                {
                    interaction.editReply( {
                        content: `${ bannee } has recieved the ban message.\nBanning now...`,
                    } );
                    bannee
                        .ban( {
                            days: time,
                            reason: `${ interaction.user.tag } || ${ reason.rule }`,
                        } )
                        .then( async () =>
                        {
                            await interaction.editReply( {
                                content: `${ bannee } has been banned. They will be unbanned <t:${ durationTimestamp }:R>`,
                            } )
                            const infraction = new Infraction()
                            await infraction.addTempBan( interaction.user.id, bannee.user.id, reason.rule, durationTimestamp )
                            const dbcaseId = infraction.tempBan.getDataValue( 'caseID' );
                            const dbtype = infraction.tempBan.getDataValue( 'type' );
                            const dbtarget = `<@${ infraction.tempBan.getDataValue( 'targetID' ) }>`;
                            const dbmod = `<@${ infraction.tempBan.getDataValue( 'modID' ) }>`;
                            const dbreason = infraction.tempBan.getDataValue( 'reason' );
                            const dbtime = `<t:${ Math.trunc( Date.parse( infraction.tempBan.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;
                            const dbduration = infraction.tempBan.getDataValue( 'duration' )

                            const embed = new MessageEmbed()
                                .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
                                .setColor( 'YELLOW' )
                                .setDescription( `**Case ID -** ${ dbcaseId }\n**Type -** ${ dbtype }\n**Target -** ${ dbtarget }\n**Moderator -** ${ dbmod }\n**Reason -** ${ dbreason }\n**Time -** ${ dbtime }\n**End-Time** - <t:${ dbduration }:F>` )
                                .setFooter( { iconURL: interaction.user.avatarURL(), text: interaction.user.tag } )
                                .setTimestamp()
                            await interaction.editReply( { embeds: [ embed ] } )
                        } )
                        .catch( ( rejectedReason ) =>
                        {
                            interaction.editReply( {
                                content: `Something went wrong. Please contact Matrical ASAP.`,
                            } );
                            console.log( rejectedReason );
                        } );
                } );
        } catch ( e )
        {
            if ( e.code === 50007 )
            {
                await interaction.editReply( {
                    content: `Cannot send messages to ${ bannee }\nBanning now...`,
                } );
                bannee
                    .ban( {
                        days: time,
                        reason: `${ interaction.user.tag } || ${ reason.rule }`,
                    } )
                    .then( async () =>
                    {
                        interaction.editReply( {
                            content: `${ bannee } has been banned. They will be unbanned <t:${ durationTimestamp }:R>`,
                        } )
                        const infraction = new Infraction()
                        await infraction.addTempBan( interaction.user.id, bannee.user.id, reason.rule, durationTimestamp )
                        const dbcaseId = infraction.tempBan.getDataValue( 'caseID' );
                        const dbtype = infraction.tempBan.getDataValue( 'type' );
                        const dbtarget = `<@${ infraction.tempBan.getDataValue( 'targetID' ) }>`;
                        const dbmod = `<@${ infraction.tempBan.getDataValue( 'modID' ) }>`;
                        const dbreason = infraction.tempBan.getDataValue( 'reason' );
                        const dbtime = `<t:${ Math.trunc( Date.parse( infraction.tempBan.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;
                        const dbduration = infraction.tempBan.getDataValue( 'duration' )

                        const embed = new MessageEmbed()
                            .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
                            .setColor( 'YELLOW' )
                            .setDescription( `**Case ID -** ${ dbcaseId }\n**Type -** ${ dbtype }\n**Target -** ${ dbtarget }\n**Moderator -** ${ dbmod }\n**Reason -** ${ dbreason }\n**Time -** ${ dbtime }\n**End-Time** - <t:${ dbduration }:F>` )
                            .setFooter( { iconURL: interaction.user.id, text: interaction.user.tag } )
                            .setTimestamp()
                        await interaction.editReply( { embeds: [ embed ] } )
                    } )
                    .catch( ( rejectedReason ) =>
                    {
                        interaction.editReply( {
                            content: `Something went wrong. Please contact Matrical ASAP.`,
                        } );
                        console.log( rejectedReason );
                    } );
            } else if ( error.name === 'SequelizeUniqueConstraintError' )
            {
                const oldBannee = await tempInfractions.findOne( { where: { userID: bannee.id } } )
                return interaction.editReply( { content: `${ bannee } already has a pending temp-ban, ending <t:${ oldBannee.getDataValue( 'finishTimeStamp' ) }:R>, on <t:${ oldBannee.getDataValue( 'finishTimeStamp' ) }:F>.` } )
            } else
            {
                console.error( e );
            }
        }
    }
}