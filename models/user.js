const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');



class User {
    constructor(id,password){
        this.id=id;
        this.password=password;
    }

    GetUser(userId) {
        const db= getDb();
        return db.collection('???')
        .find({_id: new mongodb.ObjectId(userId)})
        .next()
        .then(user=> {
            console.log(user);
            return user;
        })
        .catch(err=> {
            console.log(err);
            return false;
        });
    };
}
module.exports = User;
