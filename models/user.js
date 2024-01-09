const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, password,resetToken,resetTokenExpiration) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.resetToken=resetToken;
        this.resetTokenExpiration=resetTokenExpiration;
    }
    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }
    createUser() {
        const db = getDb();
        if (!this.getUser(this.id)) {
            console.log('id already exists!');
        } else {
            db.collection('users').insertOne(this);
        }
    }
    static deleteUser(userId) {
        const db= getDb();
        return db.collection('users').
        deleteOne({_id : new mongodb.ObjectId(userId)});
    }
    static updateUserToken(userId,resetToken,resetTokenExpiration) {
        const db= getDb();
        
        
        return db.collection('users').
        updateOne({_id: new mongodb.ObjectId(userId)}, {$set: {
            "resetToken": resetToken,
            "resetTokenExpiration": resetTokenExpiration,

          }} )
          
    }
    static getUserById(userId) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) })
            .then((user) => {
                console.log(user);
                return user;
            })
            .catch((err) => {
                console.log(err);
            });
    }
    static getUserByEmail(userEmail) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ email: userEmail })
            .then((user) => {
                return user;
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

module.exports = User;
