const { Sequelize } = require('sequelize')

const sequelize  = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Tags = sequelize.define('Tags', {
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
});

module.exports = { Tags }