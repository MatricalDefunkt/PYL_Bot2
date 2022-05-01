const permissionsBits = require( './permissionsbits' );
class PermCalculator
{
    constructor ()
    {
        this.deniedPermissions = []
        this.allowedPermissions = []
    }
    /**
     * Calculates allowed permissions by checking given bits against pre-defined list.
     * @param {Number | BigInt} bits 
     * @param {String} id
     */
    calculateAllow ( bits, id )
    {
        this.#addPerms( this.allowedPermissions, bits, id )
    }
    /**
     * Calculates allowed permissions by checking given bits against pre-defined list.
     * @param {Number | BigInt} bits 
     * @param {String} id
     */
    calculateDeny ( bits, id, type )
    {
        this.#addPerms( this.deniedPermissions, bits, id )
    }
    /**
     * The actual calculator lol
     * @param {Array} array
     * @param {Number | BigInt} bits 
     */
    #addPerms ( array, bits, id )
    {
        const permissionArray = []
        permissionsBits.forEach( entry =>
        {
            if ( ( parseInt( entry.value ) && bits ) != 0 )
            {
                permissionArray.push( entry.permission )
            }
        } );
        array.push( permissionArray )
        return array
    }
}

module.exports = PermCalculator