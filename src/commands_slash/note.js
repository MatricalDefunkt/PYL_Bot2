const { SlashCommandBuilder } = require( '@discordjs/builders' )
const { MessageEmbed, Client, CommandInteraction } = require( 'discord.js' );
const Infraction = require( '../utils/Infraction.js' );

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
    help: {
        helpDescription: `The note command adds a note onto a user and stores it. You can retrieve a note by performing /logs on the user.`,
        helpSyntax: `note <user> <note>`,
        helpEmbed: true
    },
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
        const dbcaseId = infraction.note.getDataValue( 'caseID' );
        const dbtype = infraction.note.getDataValue( 'type' );
        const dbtarget = `<@${ infraction.note.getDataValue( 'targetID' ) }>`;
        const dbmod = `<@${ infraction.note.getDataValue( 'modID' ) }>`;
        const dbreason = infraction.note.getDataValue( 'reason' );
        const dbtime = `<t:${ Math.trunc( Date.parse( infraction.note.getDataValue( 'createdAt' ) ) / 1000 ) }:F>`;

        const embed = new MessageEmbed()
            .setAuthor( { name: client.user.tag, iconURL: client.user.avatarURL() } )
            .setColor( 'YELLOW' )
            .setDescription( `**Case ID -** ${ dbcaseId }\n**Type -** ${ dbtype }\n**Target -** ${ dbtarget }\n**Moderator -** ${ dbmod }\n**Reason -** ${ dbreason }\n**Time -** ${ dbtime }` )
            .setFooter( { iconURL: interaction.user.avatarURL(), text: interaction.user.tag } )
            .setTimestamp()
        await interaction.editReply( { embeds: [ embed ] } )
        return
    }
}