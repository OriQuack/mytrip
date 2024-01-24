const mongodb= require('mongodb');
const {debugPort} = require('process');
const getDb = require('../util/database').getDb;

class Destination {
    constructor({}) {

    }
    static getDestinations(시){
        const db = getDb();
        return db.collection('destination').
        findMany({"도.시":시})
        .then( destinations=> {
            console.log(destinations);
            return destinations;
        })
        .catch(err=> {
            console.log(err);
        })
    }
    static getDestinationByName(name) {
        const db= getDb();
        return db.
        collection('destination').
        findOne({"도.시.여행지": name})
        .then( destination=> {
            return destination
        })
        .catch(err=> {
            console.log(err);
        })
    }

    
}