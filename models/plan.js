const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');

const getDb = require('../util/database').getDb;

class Plan {
    constructor({
        _id,
        name,
        ownerUsername,
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
        isDone,
        schedule = [],
        destinationCart = [],
    }) {
        this._id = _id ? _id : null; // ObjectId
        this.name = name;
        this.ownerUsername = ownerUsername; // ObjectId
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
        this.isDone = isDone;
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
        return db.collection('plans').deleteOne({ _id: this._id });
    }

    addComment(commentId) {
        const db = getDb();
        this.comments.unshift(commentId);
        return this.save();
    }

    deleteComment(commentId) {
        const db = getDb();
        this.comments = this.comments.filter((id) => !id.equals(commentId));
        return this.save();
    }

    static getPlanById(id) {
        const db = getDb();
        return db.collection('plans').findOne({ _id: id });
    }

    static filterPlans(city, sort, season, cost, numPeople, period) {
        const db = getDb();
        let query = { isPublic: true, isDone: true };
        if (city) query.city = city;
        if (season) query.season = season;
        if (cost) query.totalCost = { $lte: Number(cost) };
        if (numPeople) query.numPeople = Number(numPeople);
        if (period) query.period = Number(period);

        let sortQuery = sort == 'likes' ? { likes: -1 } : { dateAdded: -1 };

        return db.collection('plans').find(query).sort(sortQuery).toArray();
    }
}

module.exports = Plan;
