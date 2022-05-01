const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed } = require( 'discord.js' )
const { rules } = require( '../utils/rules.json' )

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'kick' )
            .setDescription( 'Kicks the given user.' )
            .addUserOption( o => o
                .setName( 'user' )
                .setDescription( 'User to kick' )
                .setRequired( true )
            )
            .addIntegerOption( o => o
                .setName( 'reason' )
                .setDescription( 'Reason for the Kick (Will appear in Audit Logs)' )
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
            .addStringOption( o => o
                .setName( 'custom-reason' )
                .setDescription( 'Please type the custom reason for the kick if you have chosen "Custom Reason" under \'Reason\'' )
            ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of Kick" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'Kick' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /kick <user> <reason> [custom-reason]\`\`\`\n\`\`\`\nUse:\nThe kick command kicks the provided user, sending them a DM with the reason, while logging the same reason in the audit logs.\`\`\``
        ),
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    async execute ( interaction, client )
    {

        await interaction.deferReply( { ephemeral: true } );
        const kickee = interaction.options.getMember( 'user' );
        let _reason = interaction.options.getInteger( 'reason' );

        if ( kickee.kickable == false )
        {
            return interaction.editReply( { content: `I cannot kick ${ kickee }. They're too powerful 🤯!!` } )
        } else if ( interaction.member === kickee )
        {
            return interaction.editReply( { content: `Okay, you have been kicked. Now move on.` } )
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
                reason = { id: 0, rule: 'None provided.', reason: 'None provided' };
            }

        } else
        {

            reason = getRule( _reason )

        }

        try
        {
            const dmChannel = await kickee.createDM( true )
            dmChannel.send( {
                content: `Message from Practice Your Language:`, embeds: [
                    new MessageEmbed()
                        .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL( { size: 512 } ) } )
                        .setColor( 'RED' )
                        .setDescription( 'A message from PYL staff:' )
                        .addField( 'Message:', 'You have been kicked from PYL for breaking (a) server rule(s)' )
                        .addField( 'Rule:', reason.rule )
                ]
            } ).then( () =>
            {
                interaction.editReply( { content: `${ kickee } has recieved the kick message.\nKicking now...` } )
                kickee
                    .kick( `${ interaction.user.tag } || ${ reason.reason }` )
                    .then(
                        interaction.editReply( { content: `${ kickee } has been kicked.` } )
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
                await interaction.editReply( { content: `Cannot send messages to ${ kickee }\nKicking now...` } )
                await kickee
                    .kick( reason.reason )
                    .then(
                        interaction.editReply( { content: `${ kickee } has been kicked, but did not recieve the message.` } )
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