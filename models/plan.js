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
        dateAdded,
        period,
        season,
        totalCost,
        numPeople,
        likes,
        scraps,
        image,
        shareUri,
        description,
        isPublic,
        schedule = [],
        destinationCart = [],
    }) {
        this._id = _id ? _id : null; // ObjectId
        this.name = name;
        this.ownerId = ownerId; // ObjectId
        this.city = city;
        this.date = date;
        this.dateAdded = dateAdded;
        this.period = period; // 며칠 동안
        this.season = season;
        this.totalCost = totalCost;
        this.numPeople = numPeople;
        this.likes = likes ? likes : 0;
        this.scraps = scraps ? scraps : 0;
        this.image = image;
        this.shareUri = shareUri ? shareUri : null;
        this.description = description ? description : null;
        this.isPublic = isPublic ? isPublic : false;
        this.schedule = schedule;
        this.destinationCart = destinationCart;
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

    static getAllSortedByDate() {
        const db = getDb();
        return db.collection('plans').find().sort({ dateAdded: 1 }).toArray();
    }

    static getAllSortedByLikes() {
        const db = getDb();
        return db.collection('plans').find().sort({ likes: -1 }).toArray();
    }

    static filterPlans(city, sort, season, cost, numPeople, period) {
        const db = getDb();
        let query = { city: city };
        if (season) query.season = season;
        if (cost) query.totalCost = { $lte: cost };
        if (numPeople) query.numPeople = numPeople;
        if (period) query.period = period;

        let sortQuery = { dateAdded: -1 };
        if (sort == 'likes') {
            sortQuery = { likes: -1 };
        }

        return db.collection('plans').find(query).sort(sortQuery).toArray();
    }
}

module.exports = Plan;
