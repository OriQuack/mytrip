const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let db;
const MONGODB_URI =
    'mongodb+srv://admin:XjeD9tG6brrwden3@mytrip.e0j3pi1.mongodb.net/mytrip';

const mongoConnect = (callback) => {
    MongoClient.connect(MONGODB_URI)
        .then((client) => {
            console.log('connected!');
            db = client.db();
            callback();
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (db) return db;
    throw 'No database found!';
};

exports.mongoConnect = mongoConnect; //데이터베이스에 연결하고 그 연결을 저장
exports.getDb = getDb; //연결된 데이터베이스를 리턴
