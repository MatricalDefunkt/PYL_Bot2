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
    reason: Sequelize.TEXT,
    guildID: Sequelize.TEXT
}, {
    tableName: 'tempBans',
} );

const Infractions = sequelize.define( 'Infractions', {
    caseID: {
        type: Sequelize.TEXT,
        unique: true,
        primaryKey: true
    },
    type: Sequelize.TEXT,
    targetID: Sequelize.TEXT,
    modID: Sequelize.TEXT,
    reason: Sequelize.STRING
}, {
    tableName: 'Infractions',
} );

try
{
    async function sync ()
    {
        await Tags.sync();
        await tempBans.sync();
        await Infractions.sync();
    }
    sync()
} catch ( e )
{
    console.error( e );
}
//TODO: Work on it lol

module.exports = { Tags, tempBans, Infractions }