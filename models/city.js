const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class City {
    constructor({ _id, name, planCount, plans = [] }) {
        this._id = _id ? _id : null; // ObjectId
        this.name = name;
        this.planCount = planCount || plans.length;
        this.plans = plans;
    }

    save() {
        const db = getDb();
        if (this._id) {
            // City exists -> update city
            return db.collection('cities').updateOne({ _id: this._id }, { $set: this });
        }
        return db.collection('cities').insertOne(this);
    }

    static getCityById(id) {
        const db = getDb();
        return db.collection('cities').findOne({ _id: new mongodb.ObjectId(id) });
    }

    static getcityByName(name) {
        const db = getDb();
        return db.collection('cities').findOne({ name: name });
    }

    addPlan(planData) {
        //planData는 Plan 객체
        const planSummary = {
            planId: planData._id,
            name: planData.name,
            ownerId: planData.ownerId,
            date: planData.date,
            likes: planData.likes,
            image: planData.image,
            isPublic: planData.isPublic,
            hashtag: planData.hashtag,
            // TODO: 필터를 해야하는데 데이터 추가??
        };
        // plans에서 동일한 planId를 가진 요소 찾기
        const existingPlanIndex = this.plans.findIndex(
            (p) => p.planId.toString() === planData._id.toString()
        );
        if (existingPlanIndex >= 0) {
            //업데이트
            this.plans[existingPlanIndex] = planSummary;
        } else {
            //추가
            this.plans.push(planSummary);
            this.planCount++;
        }
        return this.save();
    }

    removePlan(planId) {
        //planId는 ObjectId 타입이어야 한다.
        this.plans = this.plans.filter((plan) => !plan.planId.equals(planId));
        this.planCount--;
        return this.save();
    }
}

module.exports = City;
