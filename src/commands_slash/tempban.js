const { SlashCommandBuilder } = require( "@discordjs/builders" );
const { MessageEmbed } = require( "discord.js" );
const { rules } = require( "../rules.json" );
const { tempBans } = require( "../database/database" );

module.exports = {
    data: new SlashCommandBuilder()
        .setName( "tempban" )
        .setDescription( "Temporarily bans the given user." )
        .addUserOption( ( o ) =>
            o.setName( "user" ).setDescription( "User to ban" ).setRequired( true )
        )
        .addIntegerOption( ( o ) =>
            o
                .setName( "reason" )
                .setDescription(
                    "Reason for the ban (Will appear in Audit Logs)"
                )
                .addChoices( [
                    [ "Custom Reason", 0 ],
                    [ "Gen Rule#1", 101 ],
                    [ "Gen Rule#2", 102 ],
                    [ "Gen Rule#3", 103 ],
                    [ "Gen Rule#4", 104 ],
                    [ "Gen Rule#5", 105 ],
                    [ "Gen Rule#6", 106 ],
                    [ "Gen Rule#7", 107 ],
                    [ "Gen Rule#8", 108 ],
                    [ "Voice Rule#1", 201 ],
                    [ "Voice Rule#2", 202 ],
                    [ "Voice Rule#3", 203 ],
                    [ "Voice Rule#4", 204 ],
                    [ "Voice Rule#5", 205 ],
                    [ "Voice Rule#6", 206 ],
                    [ "Voice Rule#7", 207 ],
                ] )
                .setRequired( true )
        )
        .addIntegerOption( ( o ) =>
            o
                .setName( "msg-history" )
                .setDescription( "Delete the message history for the given time" )
                .addChoices( [
                    [ "Don't delete", 0 ],
                    [ "1 Day / 24 Hours", 1 ],
                    [ "2 Days / 48 Hours", 2 ],
                    [ "3 Days / 72 Hours", 3 ],
                    [ "4 Days / 96 Hours", 4 ],
                    [ "5 Days / 120 Hours", 5 ],
                    [ "6 Days / 144 Hours", 6 ],
                    [ "7 Days / 168 Hours", 7 ],
                ] )
                .setRequired( true )
        )
        .addStringOption( ( o ) =>
            o
                .setName( "duration" )
                .setDescription(
                    "Duration of the ban. Please input in the style |1W 1D 1H|"
                )
                .setRequired( true )
        )
        .addBooleanOption( ( o ) =>
            o
                .setName( "disputable" )
                .setDescription( "Whether the ban is disputable or not." )
        )
        .addStringOption( ( o ) =>
            o
                .setName( "custom-reason" )
                .setDescription(
                    "Please type the custom reason for the ban if you have chosen \"Custom Reason\" under 'Reason'"
                )
        ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of TempBan" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'TempBan' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /tempban <user> <reason> <days-of-messages-to-delete> <duration-of-ban> [custom-reason] [disputable || Default: true]\`\`\`\n\`\`\`\nUse:\nThe tempban command temporarily bans the provided user, sending them a DM with the reason, while logging the same reason in the audit logs. If applicable, the message will contain an invite to PYL Ban Appeals. It unbans the user once the time is up.\`\`\``
        ),
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( interaction, client )
    {
        await interaction.deferReply( { ephemeral: true } );
        const bannee = interaction.options.getMember( "user" );
        let _reason = interaction.options.getInteger( "reason" );
        const time = interaction.options.getInteger( "msg-history" );
        const _duration = interaction.options.getString( "duration" );

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

            if ( duration.days < 0 || duration.weeks < 0 || duration.hours < 0 ) return interaction.editReply( { content: `Time cannot go in reverse lol` } )

            durationTimestamp = Math.trunc( interaction.createdTimestamp / 1000 ) + (
                (duration.weeks * 604800) +
                (duration.days * 86400) +
                (duration.hours * 3600)
            )

            await tempBans
                .create( {
                    userID: bannee.id,
                    finishTimeStamp: durationTimestamp,
                    modID: interaction.user.id,
                    reason: reason.reason,
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
                            reason: `${ interaction.user.tag } || ${ reason.reason }`,
                        } )
                        .then(
                            interaction.editReply( {
                                content: `${ bannee } has been banned. They will be unbanned <t:${ durationTimestamp }:R>`,
                            } )
                        )
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
                        reason: `${ interaction.user.tag } || ${ reason.reason }`,
                    } )
                    .then(
                        interaction.editReply( {
                            content: `${ bannee } has been banned. They will be unbanned <t:${ durationTimestamp }:R>`,
                        } )
                    )
                    .catch( ( rejectedReason ) =>
                    {
                        interaction.editReply( {
                            content: `Something went wrong. Please contact Matrical ASAP.`,
                        } );
                        console.log( rejectedReason );
                    } );
            } else if ( error.name === 'SequelizeUniqueConstraintError' )
            {
                return interaction.editReply( { content: `${ bannee } already has a pending temp-ban.` } )
            } else
            {
                console.error( e );
            }
        }
    },
};
