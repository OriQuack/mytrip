const mongodb = require('mongodb');
const { debugPort } = require('process');

const getDb = require('../util/database').getDb;

class User {
    constructor({ username, email, password, _id, kakaoId, resetToken, resetTokenExpiration }) {
        this.username = username;
        this.email = email;
        this.password = password;
        this._id = _id ? _id : null;
        this.kakaoId = kakaoId ? kakaoId : null;
        this.resetToken = resetToken ? resetToken : null;
        this.resetTokenExpiration = resetTokenExpiration ? resetTokenExpiration : null;
    }

    save() {
        const db = getDb();
        if (this._id) {
            // User exists -> update user
            return db.collection('users').updateOne({ _id: this._id }, { $set: this });
        }
        return db.collection('users').insertOne(this);
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
        console.log(hashedPassword);
        return db.collection('users').updateOne(
            { _id: new mongodb.ObjectId(userId) },
            {
                $set: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpiration: null,
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
                throw new Error(err);
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
                throw new Error(err);
            });
    }

    static deleteUserByUsername(username) {
        const db = getDb();
        return db
            .collection('users')
            .deleteOne({ username: username })
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

    static getUserByToken(userToken) {
        const db = getDb();
        console.log(userToken);
        var token = userToken.resetToken;
        return db
            .collection('users')
            .findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
            .then((user) => {
                console.log(user);
                return user;
            })
            .catch((err) => {
                console.log(err);
            });
    }

    static getUserByKakaoId(kakao_id) {
        const db = getDb();
        return db
            .collection('users')
            .findOne({ kakaoId: kakao_id })
            .then((user) => {
                return user;
            })
            .catch((err) => {
                console.log(err);
            });
    }

}

module.exports = User;
