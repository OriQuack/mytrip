const getDb = require('../util/database').getDb;
const mongodb = require('mongodb');

class User {
    constructor(username, email, password) {
        this.name = username;
        this.email = email;
        this.password = password;
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
    static getUserById(userId) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(userId) })
            .next()
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
