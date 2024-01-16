const mongodb = require('mongodb');

const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, password, resetToken, resetTokenExpiration) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.resetToken = resetToken;
        this.resetTokenExpiration = resetTokenExpiration;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    updateUsername(username) {
        const db = getDb();
        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            {
                $set: {
                    username: username,
                },
            }
        );
    }

    static deleteUser(userId) {
        const db = getDb();
        return db.collection('users').deleteOne({ _id: new mongodb.ObjectId(userId) });
    }

    static updateUserToken(userId, resetToken, resetTokenExpiration) {
        const db = getDb();
        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(userId) },
            {
                $set: {
                    resetToken: resetToken,
                    resetTokenExpiration: resetTokenExpiration,
                },
            }
        );
    }

    static updatePassword(userId, hashedPassword) {
        const db = getDb();
        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(userId) },
            {
                $set: {
                    password: hashedPassword,
                    resetToken: undefined,
                    resetTokenExpriation: undefined,
                },
            }
        );
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

    static getUserByUsername(username) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ username: username })
            .then((user) => {
                return user;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    static deleteUserByEmail(email) {
        const db = getDb();
        return db
            .collection('users')
            .deleteOne({ email: email }) // Changed userEmail to email
            .then((result) => {
                if (result.deletedCount === 1) {
                    console.log('User successfully deleted');
                    return 1;
                } else {
                    console.log('Error in deleting a user');
                    return 0;
                }
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
    }
    /*
    static getUserByToken(userToken) {
        const db = getDb();
        console.log(userToken);
        var token = userToken.resetToken;
        return db
        .collection('users')
        .findOne({resetToken : token,resetTokenExpiration: {$gt:Date.now()}})
        .then((user)=> {
            console.log(user);
            return user;
        })
        .catch(err=> {
            console.log(err);
        })
    }
    */
}

module.exports = User;
