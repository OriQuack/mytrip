const mongodb = require('mongodb');

const Plan = require('../models/plan');
const User = require('../models/user');
const City = require('../models/city');
const { log } = require('console');

exports.getIndex = (req, res, next) => {
    res.send('<h1>Main</h1>');
};

exports.getProtected = (req, res, next) => {
    res.send(`This is ${req.user.username}`);
};

exports.postAddPlan = (req, res, next) => {
    const update = req.body._id ? true : false;
    const plan = new Plan({
        _id: update ? new mongodb.ObjectId(req.body._id) : null,
        name: req.body.name,
        ownerId: req.user._id,
        city: req.body.city,
        date: req.body.date,
        dateAdded: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        period: req.body.period,
        season: req.body.season,
        totalCost: req.body.totalCost,
        numPeople: req.body.numPeople,
        likes: req.body.likes,
        scraps: req.body.scraps,
        image: req.body.imageUrl,
        shareUri: req.body.shareUri,
        description: req.body.description,
        isPublic: req.body.isPublic,
        hashtag: req.body.hashtag,
        schedule: req.body.schedule,
    });
    // Plan에 plan 추가/변경
    plan.save()
        .then((result) => {
            const planId = update ? plan._id : result.insertedId;
            // User에 plan 추가/변경
            req.user.savePlan(plan).catch((err) => {
                console.log(err);
                return res.status(500).json({ message: 'Interner server error' });
            });
            // City에 plan 추가/변경
            City.getcityByName(req.body.city)
                .then((city) => {
                    if (!city) {
                        return res.status(404).json({ message: 'City not found' });
                    }
                    const updatingCity = new City(city);
                    updatingCity
                        .addPlan(plan)
                        .then((result) => {
                            return res.status(update ? 201 : 200).json({ planId: planId });
                        })
                        .catch((err) => {
                            console.log(err);
                            return res.status(500).json({ message: 'Interner server error' });
                        });
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(500).json({ message: 'Interner server error' });
                });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Interner server error' });
        });
};

exports.getShareUri = (req, res, next) => {
    const planId = req.body.planId;
    Plan.getPlanById(planId)
        .then((plan) => {
            if (!plan) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            if (plan.ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            if (plan.shareUri) {
                return res.status(200).json({ uri: shareUri });
            }
            const shareUri = 'http://localhost:5173/shared-trip/' + btoa(planId);
            const updatingPlan = new Plan(plan);
            updatingPlan
                .setShareUri(shareUri)
                .then((result) => {
                    return res.status(200).json({ uri: shareUri });
                })
                .catch((err) => {
                    console.log(err);
                    return res.status(500).json({ message: 'Interner server error' });
                });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Interner server error' });
        });
};

exports.getSharedPlan = (req, res, next) => {
    const planId = atob(req.params.code);
    Plan.getPlanById(planId)
        .then((plan) => {
            if (!plan) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            return res.status(200).json(plan);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Interner server error' });
        });
};

exports.deletePlan = (req, res, next) => {
    const planId = req.body.planId;
    Plan.getPlanById(planId)
        .then((plan) => {
            if (!plan) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            if (plan.ownerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized' });
            }
            // User에 plan 삭제
            req.user.removePlan(new mongodb.ObjectId(planId));
            // City에 plan 삭제
            City.getcityByName(plan.city)
                .then((city) => {
                    if (!city) {
                        return res.status(404).json({ message: 'City not found' });
                    }
                    const updatingCity = new City(city);
                    updatingCity.removePlan(new mongodb.ObjectId(planId)).catch((err) => {
                        return res.status(500).json({ message: 'Interner server error' });
                    });
                })
                .catch((err) => {
                    return res.status(500).json({ message: 'Interner server error' });
                });
            // Plan에 plan 삭제
            const updatingPlan = new Plan(plan);
            updatingPlan
                .deletePlan()
                .then((result) => {
                    return res.status(200).json({ message: 'Successfully deleted' });
                })
                .catch((err) => {
                    return res.status(500).json({ message: 'Interner server error' });
                });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Interner server error' });
        });
};

exports.getPlanByCity = (req, res, next) => {
    City.getcityByName(req.params.city)
        .then((city) => {
            if (!city) {
                return res.status(404).json({ message: 'City not found' });
            }
            city = new City(city);
            const { sort, season, cost, num } = req.query;
            const filteredPlans = city.filterPlans(sort, season, cost, num);
            return res.status(200).json(filteredPlans);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ message: 'Interner server error' });
        });
};
