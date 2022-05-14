const { Sequelize, DataTypes } = require( 'sequelize' )
const { uniqid } = require( 'uniqid' );
require( 'dotenv' ).config();

const sequelize = new Sequelize( process.env.DBNAME, process.env.DBUSERNAME, process.env.DBPASSWORD, {
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    dialect: 'mariadb',
    logging: false,
    typeValidation: true,
    pool: {
        max: 10,
        min: 1,
        acquire: 300_000,
        idle: 900_000,
    }
} );


const Tags = sequelize.define( 'Tags', {
    tagName: {
        type: DataTypes.STRING( 255 ),
        primaryKey: true
    },
    tagPerms: DataTypes.SMALLINT,
    tagReply: DataTypes.STRING,
    tagAuthor: DataTypes.STRING,
}, {
    tableName: 'Tags',
} );

const tempInfractions = sequelize.define( 'tempInfractions', {
    userID: {
        type: DataTypes.STRING( 255 ),
        primaryKey: true
    },
    finishTimeStamp: DataTypes.INTEGER,
    modID: DataTypes.TEXT,
    reason: DataTypes.STRING,
    guildID: DataTypes.TEXT,
}, {
    tableName: 'tempInfractions',
} );

const Infractions = sequelize.define( 'Infractions', {
    caseID: {
        type: DataTypes.STRING( 255 ),
        primaryKey: true,
    },
    type: DataTypes.TEXT,
    targetID: DataTypes.TEXT,
    modID: DataTypes.TEXT,
    reason: DataTypes.STRING,
    duration: DataTypes.TEXT,
}, {
    tableName: 'Infractions',
} );

const Prefix = sequelize.define( 'Prefix', {
    type: {
        type: DataTypes.STRING( 10 ),
        primaryKey: true
    },
    prefix: {
        type: DataTypes.STRING( 2 ),
        unique: true
    }
}, {
    tableName: 'Prefix',
} )

try
{

    Tags.sync().catch( ( error ) => { console.error( error ) } );
    tempInfractions.sync().catch( ( error ) => { console.error( error ) } );
    Infractions.sync().catch( ( error ) => { console.error( error ) } );
    Prefix.sync().catch( ( error ) => { console.error( error ) } );

} catch ( e )
{
    console.error( e );
}

module.exports = { Tags, tempInfractions, Infractions, Prefix }