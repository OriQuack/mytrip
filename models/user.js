const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class User {
    constructor(id,password){
        this.id=id;
        this.password=password;
    }
    CreateUser(){
        const db= getDb();
        if(!this.GetUser(this.id))
        {
            console.log("id already exists!");

        }
        else {
            db.collection('???')
            .insertOne(this);
        }   
        
        
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
        });
    };
}


module.exports = User;
