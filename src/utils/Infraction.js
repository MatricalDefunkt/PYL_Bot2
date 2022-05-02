const { Infractions } = require( '../database/database' );
const uniqid = require( 'uniqid' );
const { Model } = require( 'sequelize' );


class Infraction
{
    constructor ()
    {
        this.note;
        this.ban;
        this.tempBan;
        this.mute;
        this.tempMute;
        this.warn;
    }
    /**
     * Adds a note in the database for the given user.
     * @param {String} moderatorId 
     * @param {String} target 
     * @param {String} _note 
     * @returns {Promise<Model> | Error}
     */
    async addNote ( moderatorId, target, _note )
    {
        const note = await Infractions.create( {
            caseID: uniqid( 'note--' ),
            type: 'Note',
            targetID: target,
            modID: moderatorId,
            reason: _note
        } ).catch( error => console.log( error ) )
        return this.note = note
    }
    /**
     * Adds a ban in the database for the given user.
     * @param {String} moderatorId 
     * @param {String} target 
     * @param {String} reason 
     * @returns {Promise<Model> | Error}
     */
    async addBan ( moderatorId, target, reason )
    {   
        const ban = await Infractions.create( {
            caseID: uniqid( 'ban--' ),
            type: 'Ban',
            targetID: target,
            modID: moderatorId,
            reason: reason
        } ).catch( error => console.log( error ) )
        return this.ban = ban
    }
}

module.exports = Infraction