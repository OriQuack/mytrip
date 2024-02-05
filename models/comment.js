const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Comment {
    constructor({ _id, userId, content, date }) {
        this._id = _id ? _id : null;
        this.userId = userId;
        this.content = content; // "멋져요"
        this.date = date; //"2024.01.26 12:56"
    }

    save() {
        const db = getDb();
        // if (this._id) {
        //     return db.collection('comments').updateOne({ _id: this._id }, { $set: this });
        // }
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
}

module.exports = Comment;
