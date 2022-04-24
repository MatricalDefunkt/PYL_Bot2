const { tempBans } = require( "./database" );

tempBans.create({
    userID: '300580046563704832',
    finishTimeStamp: (Date.now() + 30000),
    modID: '714473790939332679',
    reason: 'test',
    guildID: '945355751260557393'
})