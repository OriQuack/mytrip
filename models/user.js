const mongodb = require('mongodb');
const Plan = require('./plan');
const DKIM = require('nodemailer/lib/dkim');
const { debugPort } = require('process');

const getDb = require('../util/database').getDb;

class User {
    constructor({ username, email, password, _id, kakaoId, resetToken, resetTokenExpiration, likedPlans = [], scrapPlans = [], myPlans = [] }) {
        this.username = username;
        this.email = email;
        this.password = password;
        this._id = _id ? _id : null;
        this.kakaoId = kakaoId ? kakaoId : null;
        this.resetToken = resetToken ? resetToken : null;
        this.resetTokenExpiration = resetTokenExpiration ? resetTokenExpiration : null;
        this.likedPlans = likedPlans;
        this.scrapPlans = scrapPlans;
        this.myPlans = myPlans.map(planData => new Plan(planData));
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
        const token = userToken.resetToken;
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
                throw new Error(err);
            });
    }

    addLikedPlan(planId) {
        this.likedPlans.push(planId);
        return this.save();
    }

    removeLikedPlan(planId) {
        this.likedPlans = this.likedPlans.filter(id => !id.equals(planId));
        return this.save();
    }

    addScrapPlan(planId) {
        this.scrapPlans.push(planId);
        return this.save();
    }

    removeScrapPlan(planId) {
        this.scrapPlans = this.scrapPlans.filter(id => !id.equals(planId));
        return this.save();
    }

    addPlan(plan) {
        const newPlan = new Plan(plan);
        this.myPlans.push(newPlan);
        return this.save();
    }

    removePlan(plan_id) {
        this.myPlans = this.myPlans.filter(plan => plan.plan_id !== plan_id);
        return this.save();
    }

}

module.exports = User;
