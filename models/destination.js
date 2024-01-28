const mongodb = require('mongodb');
const { debugPort } = require('process');
const getDb = require('../util/database').getDb;

class Destination {
    constructor({ _do, _si, name, latitude, longitude, count }) {
        this._do = _do;
        this._si = _si;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.count = count;
    }
    //TO DO: 여행지 추가 하는 로직>
    save() {
        const db = getDb();
        const filter = {
            도: this._do,
            '지역.도시': this._si,
        };
        const update = {
            $push: {
                '지역.$.여행지': {
                    이름: this.name,
                    좌표: {
                        latitude: this.latitude,
                        longitude: this.longitude,
                    },
                    방문수: 0,
                },
            },
        };
        if (getDestinationByName(this.name)) {
            //이미 존재하는 여행지
            console.log('destination exists');
        }
        return db.collection('Destination').updateOne(filter, update, { upsert: true });
    }

    static getDestinations(_si) {
        //시 검색시 여행지 목록
        const db = getDb();
        return db
            .collection('Destination')
            .aggregate([
                { $unwind: '$지역' },
                { $match: { '지역.도시': _si } },
                { $unwind: '$지역.여행지' },
                { $project: { '지역.여행지': 1, _id: 0 } },
            ])
            .toArray()
            .then((destinations) => {
                console.log(destinations[0]);
                return destinations;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(err);
            });
    }

    static getDestinationByName(name) {
        //여행지 검색시
        const db = getDb();
        return db
            .collection('Destination')
            .aggregate([
                { $unwind: '$지역' },
                { $unwind: '$지역.여행지' },
                { $match: { '지역.여행지.이름': name } },
                { $project: { '지역.여행지': 1, _id: 0 } },
            ])
            .toArray()
            .then((destination) => {
                return destination;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(err);
            });
    }
}
module.exports = Destination;
