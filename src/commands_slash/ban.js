const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed } = require( 'discord.js' )
const { rules } = require( '../rules.json' )

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'ban' )
            .setDescription( 'Bans the given user.' )
            .addUserOption( o => o
                .setName( 'user' )
                .setDescription( 'User to ban' )
                .setRequired( true )
            )
            .addIntegerOption( o => o
                .setName( 'reason' )
                .setDescription( 'Reason for the ban (Will appear in Audit Logs)' )
                .addChoices( [
                    [ 'Custom Reason', 0 ],
                    [ 'Gen Rule#1', 101 ],
                    [ 'Gen Rule#2', 102 ],
                    [ 'Gen Rule#3', 103 ],
                    [ 'Gen Rule#4', 104 ],
                    [ 'Gen Rule#5', 105 ],
                    [ 'Gen Rule#6', 106 ],
                    [ 'Gen Rule#7', 107 ],
                    [ 'Gen Rule#8', 108 ],
                    [ 'Voice Rule#1', 201 ],
                    [ 'Voice Rule#2', 202 ],
                    [ 'Voice Rule#3', 203 ],
                    [ 'Voice Rule#4', 204 ],
                    [ 'Voice Rule#5', 205 ],
                    [ 'Voice Rule#6', 206 ],
                    [ 'Voice Rule#7', 207 ]
                ] )
                .setRequired( true )
            )
            .addIntegerOption( o => o
                .setName( 'msg-history' )
                .setDescription( 'Delete the message history for the given time' )
                .addChoices( [
                    [ 'Don\'t delete', 0 ],
                    [ '1 Day / 24 Hours', 1 ],
                    [ '2 Days / 48 Hours', 2 ],
                    [ '3 Days / 72 Hours', 3 ],
                    [ '4 Days / 96 Hours', 4 ],
                    [ '5 Days / 120 Hours', 5 ],
                    [ '6 Days / 144 Hours', 6 ],
                    [ '7 Days / 168 Hours', 7 ]
                ] )
                .setRequired( true )
            )
            .addBooleanOption( o => o
                .setName( 'disputable' )
                .setDescription( 'Whether the ban is disputable or not.' )
            )
            .addStringOption( o => o
                .setName( 'custom-reason' )
                .setDescription( 'Please type the custom reason for the ban if you have chosen "Custom Reason" under \'Reason\'' )
            ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of Ban" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'Ban' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /ban <user> <reason> <days-of-messages-to-delete> [custom-reason] [disputable || Default: true]\`\`\`\n\`\`\`\nUse:\nThe ban command bans the provided user, sending them a DM with the reason, while logging the same reason in the audit logs. If applicable, the message will contain an invite to PYL Ban Appeals.\`\`\``
        ),
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( interaction, client )
    {

        await interaction.deferReply( { ephemeral: true } );
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

            reason = { id: 0, rule: interaction.options.getString( 'custom-reason' ) }
            if ( !reason )
            {
                reason = { id: 0, rule: 'None provided.', reason: 'None provided.' };
            }

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
                    .then(
                        interaction.editReply( { content: `${ bannee } has been banned.` } )
                    )
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
                    .then(
                        interaction.editReply( { content: `${ bannee } has been banned.` } )
                    )
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