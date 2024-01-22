const mongodb = require('mongodb');

const getDb = require('../util/database').getDb;

class Plan {
    constructor({ name, _id, ownerId, city, time: date, likes, totalCost, isPublic, schedule }) {
        this.name = name;
        this._id = _id ? _id : null;
        this.ownerId = ownerId;
        this.city = city;
        this.date = date; // 날짜
        this.period = period; // 며칠동안
        // this.season = -> 날짜에 따라 계산 TODO
        this.likes = likes ? likes : 0;
        this.views = views ? views : 0;
        this.scraps = scraps ? scraps : 0;
        this.totalCost = totalCost;
        this.isPublic = isPublic;
        this.isComplete = isComplete;
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
        return db
            .collection('plans')
            .findOne({ _id: id })
            .then((plan) => {
                return plan;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(err);
            });
    }
}

module.exports.Plan;
