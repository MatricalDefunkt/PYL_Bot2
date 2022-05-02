const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction } = require( 'discord.js' );
const Infraction = require( '../utils/infraction' );

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName( 'note' )
            .setDescription( 'Creates a note on the given user.' )
            .addUserOption( o => o
                .setName( 'user' )
                .setDescription( 'User to put a note on.' )
                .setRequired( true )
            )
            .addStringOption( o => o
                .setName( 'note' )
                .setDescription( 'The note you would like to add onto the user.' )
                .setRequired( true )
            ),
    helpEmbed: new MessageEmbed()
        .setTitle( "Use of Note" )
        .setAuthor( {
            name: "PYL Bot#9640",
            iconURL: `https://cdn.discordapp.com/avatars/954655539546173470/4c10aad2d82cdff4dcb05a6c83005739.webp`,
        } )
        .setColor( "GREEN" )
        .setDescription(
            `Syntax and use of 'Note' command:\n\`\`\`diff\n+   <Mandatory>\n-   [Optional]\`\`\`\n\`\`\`diff\n+   /note <user> <note>\`\`\`\n\`\`\`\nUse:\nThe note command adds a note onto a user and stores it. You can retrieve a note by performing /logs on the user.\`\`\``
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

        await interaction.deferReply( { ephemeral: true } );
        const userForNote = interaction.options.getMember( 'user' );
        const note = interaction.options.getString( 'note' )

        const infraction = new Infraction()
        await infraction.addNote( interaction.user.id, userForNote.id, note )
        const caseId = infraction.note.getDataValue( 'caseID' );
        const type = infraction.note.getDataValue( 'type' );
        const target = `<@${ infraction.note.getDataValue( 'targetID' ) }>`;
        const mod = `<@${ infraction.note.getDataValue( 'modID' ) }>`;
        const reason = infraction.note.getDataValue( 'reason' );
        const time = `<t:${ Math.trunc( Date.parse( infraction.note.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;

        const embed = new MessageEmbed()
            .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
            .setColor('YELLOW')
            .setDescription(`*Case ID -* ${ caseId }\n*Type -* ${ type }\n*Target -* ${ target }\n*Moderator -* ${ mod }\n*Reason -* ${ reason }\n*Time -* ${ time }`)
        interaction.editReply( {embeds: [embed]} )
    }
}