
module.exports = {
    name: 'rateLimit',
    async handle ( client, rateLimitData )
    {

        console.log( 'Client is being ratelimited.\n' + JSON.stringify(rateLimitData) );

    }
}