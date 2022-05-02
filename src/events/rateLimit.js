
module.exports = {
    name: 'rateLimit',
    async handle ( client, rateLimitData )
    {

        console.log( 'Client is being ratelimited.\n' );
        console.log(rateLimitData);

    }
}