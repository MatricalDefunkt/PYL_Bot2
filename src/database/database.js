const { Sequelize } = require( 'sequelize' )

const sequelize = new Sequelize( 'database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
} );

const Tags = sequelize.define( 'Tags', {
    tagName: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
    },
    tagPerms: Sequelize.INTEGER,
    tagReply: Sequelize.TEXT,
    tagAuthor: Sequelize.STRING,
}, {
    tableName: 'Tags',
} );

const tempBans = sequelize.define( 'tempBans', {
    userID: {
        type: Sequelize.TEXT,
        unique: true,
        primaryKey: true
    },
    finishTimeStamp: Sequelize.INTEGER,
    modID: Sequelize.TEXT,
    reason: Sequelize.STRING,
}, {
    tableName: 'tempBans',
} );
try
{
    const sync = async ( Tags, tempBans ) =>
    {
        await Tags.sync()
        await tempBans.sync()
    }
    sync( Tags, tempBans )
} catch ( e )
{
    console.error( e );
}
//TODO: Create table for infractions
//TODO: Work on it lol

module.exports = { Tags, tempBans }