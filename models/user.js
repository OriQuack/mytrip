const mongodb = require('mongodb');
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
        this.myPlans = myPlans;
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

    addLikedPlan(planId) { //planId는 ObjectId 타입이어야 한다.
        this.likedPlans.push(planId);
        return this.save();
    }

    removeLikedPlan(planId) { //planId는 ObjectId 타입이어야 한다.
        this.likedPlans = this.likedPlans.filter(id => !id.equals(planId));
        return this.save();
    }

    addScrapPlan(planData) {
        const planSummary = {
            planId: planData._id,
            name: planData.name,
            ownerId: planData.ownerId,
            city: planData.city,
            date: planData.date,
            likes: planData.likes,
            scraps: planData.scraps,
            isPublic: planData.isPublic
        };
        this.scrapPlans.push(planSummary);
        return this.save();
    }

    removeScrapPlan(planId) { //planId는 ObjectId 타입이어야 한다.
        this.scrapPlans = this.scrapPlans.filter(plan => !plan.planId.equals(planId));
        return this.save();
    }

    addPlan(planData) {
        const planSummary = {
            planId: planData._id,
            name: planData.name,
            ownerId: planData.ownerId,
            city: planData.city,
            date: planData.date,
            likes: planData.likes,
            scraps: planData.scraps,
            isPublic: planData.isPublic
        };
        this.myPlans.push(planSummary);
        return this.save();
    }

    removePlan(planId) { //planId는 ObjectId 타입이어야 한다.
        this.myPlans = this.myPlans.filter(plan => !plan.planId.equals(planId));
        return this.save();
    }
}

module.exports = User;
