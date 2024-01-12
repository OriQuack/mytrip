const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }
    // 안쓰는데 지워도 되나??
    // createUser() {
    //     const db = getDb();
    //     if (!this.getUser(this.id)) {
    //         console.log('id already exists!');
    //     } else {
    //         db.collection('users').insertOne(this);
    //     }
    // }
    // static getUserById(userId) {
    //     const db = getDb();
    //     return db
    //         .collection('users')
    //         .findOne({ _id: new mongodb.ObjectId(userId) })
    //         .then((user) => {
    //             console.log(user);
    //             return user;
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         });
    // }
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
    static getUserByUsername(name) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ username: name })
            .then((user) => {
                return user;
            })
            .catch((err) => {
                console.log(err);
            });
    }
}

module.exports = User;
