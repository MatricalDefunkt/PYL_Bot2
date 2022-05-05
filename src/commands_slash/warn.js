const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction } = require( 'discord.js' );
const Infraction = require( '../utils/Infraction.js' );
const { rules } = require( '../utils/rules.json' )

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'warn' )
            .setDescription( 'Creates a warn for the given user.' )
            .addUserOption( o => o
                .setName( 'user' )
                .setDescription( 'User to warn.' )
                .setRequired( true )
            )
            .addIntegerOption( o => o
                .setName( 'reason' )
                .setDescription( 'Reason for the warn (Will appear in Audit Logs)' )
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
                .setDescription( 'Please type the custom reason for the warn if you have chosen "Custom Reason" under \'Reason\'' )
            ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of Warn" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'Warn' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /warn <user> <reason> [custom-reason]\`\`\`\n\`\`\`\nUse:\nThe warn command adds a warn onto a user and stores it, optionally sending a DM about the same to the user.\`\`\``
        ),
    permissions: {
        ownerOnly: false,
        staffOnly: true,
        adminOnly: false,
    },
    /**
     * 
     * @param {CommandInteraction} interaction 
     * @param {Client} client 
     * @returns {Promise<void>}
     */
    async execute ( interaction, client )
    {

        console.log('here')

        await interaction.deferReply( { ephemeral: true } );
        const userForWarn = interaction.options.getMember( 'user' );
        const _reason = interaction.options.getInteger( 'reason' );

        /**
         * 
         * @param {Number} reasonID 
         * @returns 
         */
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
            const dmChannel = await userForWarn.createDM( true )
            dmChannel.send( {
                content: `Message from Practice Your Language:`, embeds: [
                    new MessageEmbed()
                        .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL( { size: 512 } ) } )
                        .setColor( 'RED' )
                        .setDescription( 'A message from PYL staff:' )
                        .addField( 'Message:', 'You have been warned in PYL for breaking (a) server rule(s)' )
                        .addField( 'Rule:', reason.rule )
                ]
            } ).then( async () =>
            {
                interaction.editReply( { content: `${ userForWarn } has recieved the warn message.\nSaving now...` } )
                const infraction = new Infraction()
                await infraction.addWarn( interaction.user.id, userForWarn.user.id, reason.reason )
                const dbcaseId = infraction.warn.getDataValue( 'caseID' );
                const dbtype = infraction.warn.getDataValue( 'type' );
                const dbtarget = `<@${ infraction.warn.getDataValue( 'targetID' ) }>`;
                const dbmod = `<@${ infraction.warn.getDataValue( 'modID' ) }>`;
                const dbreason = infraction.warn.getDataValue( 'reason' );
                const dbtime = `<t:${ Math.trunc( Date.parse( infraction.warn.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;

                const embed = new MessageEmbed()
                    .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
                    .setColor( 'YELLOW' )
                    .setDescription( `**Case ID -** ${ dbcaseId }\n**Type -** ${ dbtype }\n**Target -** ${ dbtarget }\n**Moderator -** ${ dbmod }\n**Reason -** ${ dbreason }\n**Time -** ${ dbtime }` )
                    .setFooter( { iconURL: interaction.user.avatarURL(), text: interaction.user.tag } )
                    .setTimestamp()
                await interaction.editReply( { embeds: [ embed ] } )
            } )
        } catch ( e )
        {
            if ( e.code === 50007 )
            {
                interaction.editReply( { content: `Cannot send messages to ${ userForWarn }\nSaving now...` } )
                    .then( async () =>
                    {
                        await interaction.editReply( { content: `${ userForWarn } has been warned, but did not recieve the message.` } )
                        const infraction = new Infraction()
                        await infraction.addWarn( interaction.user.id, userForWarn.user.id, reason.reason )
                        const dbcaseId = infraction.warn.getDataValue( 'caseID' );
                        const dbtype = infraction.warn.getDataValue( 'type' );
                        const dbtarget = `<@${ infraction.warn.getDataValue( 'targetID' ) }>`;
                        const dbmod = `<@${ infraction.warn.getDataValue( 'modID' ) }>`;
                        const dbreason = infraction.warn.getDataValue( 'reason' );
                        const dbtime = `<t:${ Math.trunc( Date.parse( infraction.warn.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;

                        const embed = new MessageEmbed()
                        .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
                        .setColor( 'YELLOW' )
                        .setDescription( `**Case ID -** ${ dbcaseId }\n**Type -** ${ dbtype }\n**Target -** ${ dbtarget }\n**Moderator -** ${ dbmod }\n**Reason -** ${ dbreason }\n**Time -** ${ dbtime }` )
                        .setFooter( { iconURL: interaction.user.avatarURL(), text: interaction.user.tag } )
                        .setTimestamp()
                    await interaction.editReply( { embeds: [ embed ] } )
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