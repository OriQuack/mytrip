const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class City {
    constructor({ _id, name, planCount, plans = [] }) {
        this._id = _id ? new mongodb.ObjectId(_id) : null;
        this.name = name;
        this.planCount = planCount;
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

    updatePlanCount() {
        this.planCount = this.plans.length;
        return this.save();
    }

    static getCityById(id) {
        const db = getDb();
        return db.collection('cities').findOne({ _id: new mongodb.ObjectId(id) });
    }

    addPlan(planData) {
        const planSummary = {
            planId: planData._id,
            name: planData.name,
            ownerId: planData.ownerId,
            date: planData.date,
            likes: planData.likes,
            scraps: planData.scraps
        };
        this.plans.push(planSummary);
        this.updatePlanCount();
        return this.save();
    }

    removePlan(planId) {
        this.plans = this.plans.filter(plan => plan.planId !== planId);
        this.updatePlanCount();
        return this.save();
    }
}

module.exports.City;
