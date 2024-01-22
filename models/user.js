const mongodb = require('mongodb');
const DKIM = require('nodemailer/lib/dkim');
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

    updateUsername(username) {
        this.username = username;
        return this.save();
    }

    updateUserToken(resetToken, resetTokenExpiration) {
        this.resetToken = resetToken;
        this.resetTokenExpiration = resetTokenExpiration;
        return this.save();
    }

    updatePassword(hashedPassword) {
        this.password = hashedPassword;
        this.resetToken = null;
        this.resetTokenExpiration = null;
        return this.save();
    }

    deleteUser() {
        const db = getDb();
        return db.collection('users').deleteOne({ _id: new mongodb.ObjectId(this._id) });
    }

    static getUserByEmail(userEmail) {
        const db = getDb();
        return db.collection('users').findOne({ email: userEmail });
    }

    static getUserByUsername(username) {
        const db = getDb();
        return db.collection('users').findOne({ username: username });
    }

    static getUserByToken(userToken) {
        const db = getDb();
        console.log(userToken);
        var token = userToken.resetToken;
        return db
            .collection('users')
            .findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
            .then((user) => {
                return user;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(err);
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
