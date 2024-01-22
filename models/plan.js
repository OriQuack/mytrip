const mongodb = require('mongodb');

const getDb = require('../util/database').getDb;

class Plan {
    constructor({ _id, name, ownerId, city, time: date, likes, isPublic, schedule }) {
        this._id = _id ? _id : null;
        this.name = name;
        this.ownerId = ownerId;
        this.city = city;
        this.date = date; // 날짜
        // this.period = -> 날짜에 따라 계산 TODO
        // this.season = -> 날짜에 따라 계산 TODO
        this.likes = likes ? likes : 0;
        this.scraps = scraps ? scraps : 0;
        // this.totalCost = -> schedule 따라 계산 TODO
        this.isPublic = isPublic;
        this.schedule = schedule;
    }

    save() {
        const db = getDb();
        if (this._id) {
            // Plan exists -> update plan
            return db.collection('plans').updateOne({ _id: this._id }, { $set: this });
        }
        return db.collection('plans').insertOne(this);
    }

    static getPlanById(id) {
        const db = getDb();
        return db.collection('plans').findOne({ _id: id });
    }
}

module.exports.Plan;
