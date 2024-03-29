const { throws } = require('assert');
const mongodb = require('mongodb');
const DKIM = require('nodemailer/lib/dkim');
const { debugPort } = require('process');
const getDb = require('../util/database').getDb;

class User {
    constructor({
        username,
        email,
        password,
        _id,
        snsLogin,
        kakaoId,
        resetToken,
        resetTokenExpiration,
        likedPlans = [],
        scrapPlans = [],
        myPlans = [],
    }) {
        this.username = username;
        this.email = email;
        this.password = password;
        this._id = _id ? _id : null; // ObjectId
        (this.snsLogin = snsLogin ? snsLogin : null), (this.kakaoId = kakaoId ? kakaoId : null);
        this.resetToken = resetToken ? resetToken : null;
        this.resetTokenExpiration = resetTokenExpiration ? resetTokenExpiration : null;
        this.likedPlans = likedPlans; //plan id의 배열
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

    //likedPlan은 plan id의 배열
    addLikedPlan(planId) {
        //planId는 ObjectId 타입이어야 한다.
        this.likedPlans.push(planId);
        return this.save();
    }

    removeLikedPlan(planId) {
        //planId는 ObjectId 타입이어야 한다.
        this.likedPlans = this.likedPlans.filter((id) => !id.equals(planId));
        return this.save();
    }

    addScrapPlan(planData) {
        //planData는 Plan 객체
        const planSummary = {
            planId: planData._id,
            name: planData.name,
            ownerUsername: planData.ownerUsername,
            city: planData.city,
            date: planData.date,
            likes: planData.likes,
            image: planData.image,
            season: planData.season,
            period: planData.period,
            numPeople: planData.numPeople,
            totalCost: planData.totalCost,
            isPublic: planData.isPublic,
        };
        this.scrapPlans.unshift(planSummary);
        return this.save();
    }

    removeScrapPlan(planId) {
        //planId는 ObjectId 타입이어야 한다.
        this.scrapPlans = this.scrapPlans.filter((plan) => !plan.planId.equals(planId));
        return this.save();
    }

    savePlan(planData) {
        //planData는 Plan 객체
        const planSummary = {
            planId: planData._id,
            name: planData.name,
            ownerUsername: planData.ownerUsername,
            city: planData.city,
            date: planData.date,
            period: planData.period,
            numPeople: planData.numPeople,
            totalCost: planData.numPeople,
            likes: planData.likes,
            image: planData.image,
            isDone: planData.isDone,
            isPublic: planData.isPublic,
        };

        // myPlans에서 동일한 planId를 가진 요소 찾기
        const existingPlanIndex = this.myPlans.findIndex(
            (p) => p.planId.toString() === planData._id.toString()
        );

        if (existingPlanIndex >= 0) {
            //업데이트
            this.myPlans[existingPlanIndex] = planSummary;
        } else {
            //추가
            this.myPlans.unshift(planSummary);
        }
        return this.save();
    }

    removePlan(planId) {
        //planId는 ObjectId 타입이어야 한다.
        this.myPlans = this.myPlans.filter((plan) => !plan.planId.equals(planId));
        return this.save();
    }
}

module.exports = User;
