const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Comment {
    constructor({ _id, userId, content, date }) {
        this._id = _id ? _id : null;
        this.planId = planId;
        this.userId = userId;
        this.content = content; // "멋져요"
        this.date = date; //"2024.01.26 12:56"
    }

    save() {
        const db = getDb();
        return db.collection('comments').insertOne(this);
    }

    deleteComment() {
        const db = getDb();
        return db.collection('comments').deleteOne({ _id: new mongodb.ObjectId(this._id) });
    }

    static getCommentById(id) {
        const db = getDb();
        return db.collection('comments').findOne({ _id: new mongodb.ObjectId(id) });
    }

    static getCommentsByPlan(planId) {
        const db = getDb();
        return db.collection('comments').find({ planId: planId }).toArray();
    }
}

module.exports = Comment;
