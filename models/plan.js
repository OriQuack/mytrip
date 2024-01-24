const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');

const getDb = require('../util/database').getDb;

class Plan {
    constructor({
        _id,
        name,
        ownerId,
        city,
        date,
        period,
        season,
        totalCost,
        likes,
        scraps,
        isPublic,
        schedule = [],
        shareUri,
    }) {
        this._id = _id ? _id : null;
        this.name = name;
        this.ownerId = ownerId;
        this.city = city;
        this.date = date;
        this.period = period; // 며칠 동안
        this.season = season;
        this.likes = likes ? likes : 0;
        this.scraps = scraps ? scraps : 0;
        this.totalCost = totalCost;
        this.isPublic = isPublic;
        this.schedule = schedule;
        this.shareUri = shareUri ? shareUri : null;
    }

    save() {
        const db = getDb();
        if (this._id) {
            // Plan exists -> update plan
            return db.collection('plans').updateOne({ _id: this._id }, { $set: this });
        }
        return db.collection('plans').insertOne(this);
    }

    setShareUri(uri) {
        this.shareUri = uri;
        return this.save();
    }

    deletePlan() {
        const db = getDb();
        return db.collection('plans').deleteOne({ _id: new mongodb.ObjectId(this._id) });
    }

    static getPlanById(id) {
        const db = getDb();
        return db.collection('plans').findOne({ _id: new mongodb.ObjectId(id) });
    }
}

module.exports = Plan;
