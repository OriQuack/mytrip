const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Comment {
    constructor({
        _id,
        userId,  // ObjectID
        content,
        date
    }) {
        this._id = _id ? _id : null;
        this.userId = userId;
        this.content = content; // "멋져요"
        this.date = date; //"2024.01.26 12:56"
    }

    save() {
        const db = getDb();
        return db.collection('comments').insertOne(this);
    }

    static getCommentById(id) {
        const db = getDb();
        return db.collection('comments').findOne({ _id: new mongodb.ObjectId(id) });
    }

    removeComment(id) {
        const db = getDb();
        return db.collection('comments').deleteOne({ _id: new mongodb.ObjectId(this._id) });
    }
}

module.exports = Comment;
