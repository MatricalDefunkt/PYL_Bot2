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
        this.convertBan;
        this.unban
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
    /**
     * Adds an unban in the database for the given user.
     * @param {String} moderatorId 
     * @param {String} target 
     * @param {String} reason 
     * @returns {Promise<Model> | Error}
     */
    async addUnBan ( moderatorId, target, reason )
    {
        const unban = await Infractions.create( {
            caseID: uniqid( 'unban--' ),
            type: 'Unban',
            targetID: target,
            modID: moderatorId,
            reason: reason
        } ).catch( error => console.log( error ) )
        return this.unban = unban
    }
    /**
     * Adds a temporary ban in the database for the given user.
     * @param {String} moderatorId 
     * @param {String} target 
     * @param {String} reason 
     * @param {Number} duration
     * @returns {Promise<Model> | Error}
     */
    async addTempBan ( moderatorId, target, reason, duration )
    {
        const tempBan = await Infractions.create( {
            caseID: uniqid( 'tempban--' ),
            type: 'TempBan',
            targetID: target,
            modID: moderatorId,
            reason: reason,
            duration: duration
        } ).catch( error => console.log( error ) )
        return this.tempBan = tempBan
    }
    /**
     * Adds a temporary mute in the database for the given user.
     * @param {String} moderatorId 
     * @param {String} target 
     * @param {String} reason 
     * @param {Number} duration
     * @returns {Promise<Model> | Error}
     */
    async addTempMute ( moderatorId, target, reason, duration )
    {
        const tempMute = await Infractions.create( {
            caseID: uniqid( 'tempmute--' ),
            type: 'TempMute',
            targetID: target,
            modID: moderatorId,
            reason: reason,
            duration: duration
        } ).catch( error => console.log( error ) )
        return this.tempMute = tempMute
    }
    /**
     * Adds a converted ban in the database for the given user.
     * @param {String} moderatorId 
     * @param {String} target 
     * @param {String} reason 
     * @returns {Promise<Model> | Error}
     */
    async addConvertBan ( moderatorId, target, reason )
    {
        const convertBan = await Infractions.create( {
            caseID: uniqid( 'convertban--' ),
            type: 'ConvertBan',
            targetID: target,
            modID: moderatorId,
            reason: reason
        } ).catch( error => console.log( error ) )
        return this.convertBan = convertBan
    }
    /**
     * Adds a kick in the database for the given user.
     * @param {String} moderatorId 
     * @param {String} target 
     * @param {String} reason 
     * @returns {Promise<Model> | Error}
     */
    async addKick ( moderatorId, target, reason )
    {
        const kick = await Infractions.create( {
            caseID: uniqid( 'kick--' ),
            type: 'Kick',
            targetID: target,
            modID: moderatorId,
            reason: reason
        } ).catch( error => console.log( error ) )
        return this.kick = kick
    }
    /**
     * Adds a warn in the database for the given user.
     * @param {String} moderatorId 
     * @param {String} target 
     * @param {String} reason 
     * @returns {Promise<Model> | Error}
     */
    async addWarn ( moderatorId, target, reason )
    {
        const warn = await Infractions.create( {
            caseID: uniqid( 'warn--' ),
            type: 'Warn',
            targetID: target,
            modID: moderatorId,
            reason: reason
        } ).catch( error => console.log( error ) )
        return this.warn = warn
    }
}

module.exports = Infraction