const Plan = require('../models/plan');
const User = require('../models/user');
const City = require('../models/city');

exports.getIndex = (req, res, next) => {
    res.send('<h1>Main</h1>');
};

exports.getProtected = (req, res, next) => {
    res.send(`This is ${req.user.username}`);
};

exports.postAddPlan = (req, res, next) => {
    const update = req.body.planId ? true : false;
    const plan = new Plan({
        _id: req.body.planId,
        name: req.body.name,
        ownerId: req.user._id,
        city: req.body.city,
        date: req.body.date,
        period: req.body.period,
        season: req.body.season,
        totalCost: req.body.totalCost,
        likes: req.body.likes,
        scraps: req.body.scraps,
        image: req.body.imageUrl,
        shareUri: req.body.shareUri,
        description: req.body.description,
        isPublic: req.body.isPublic,
        hashtag: req.body.hashtag,
        schedule: req.body.schedule,
    });
    plan.save()
        .then((result) => {
            // TODO: User 에 plan 추가 / 변경
            // TODO: City 에 plan 추가 / 변경
            req.user.addPlan(plan);
            return res
                .status(update ? 200 : 201)
                .json({ planId: update ? result.upsertedId : result.insertedId });
        })
        .catch((err) => {
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
