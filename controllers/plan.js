const Plan = require('../models/plan');

exports.getIndex = (req, res, next) => {
    res.send('<h1>Main</h1>');
};

exports.getProtected = (req, res, next) => {
    res.send(`This is ${req.user.username}`);
};

exports.postAddPlan = (req, res, next) => {
    const update = req.body.planId ? true : false;
    const plan = new Plan({
        palnId: req.body.planId,
        name: req.body.name,
        ownerId: req.user._id,
        city: req.body.city,
        date: req.body.date,
        period: req.body.period,
        season: req.body.season,
        totalCost: req.body.totalCost,
        isPublic: req.body.isPublic,
        schedule: req.body.schedule,
        shareUri: shareUri,
    });
    plan.save()
        .then((result) => {
            // TODO: User 에 planId 추가 / 변경
            // TODO: City 에 planId 추가 / 변경
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
    const shareUri = 'http://localhost:5173/shared-trip/' + btoa(planId);
    Plan.getPlanById(planId)
        .then((plan) => {
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
            return res.status(404).json({ message: 'Plan not found' });
        });
};

exports.getSharedPlan = (req, res, next) => {
    const planId = atob(req.params.code);
    Plan.getPlanById(planId)
        .then((plan) => {
            return res.status(200).json(plan);
        })
        .catch((err) => {
            console.log(err);
            return res.status(404).json({ message: 'Plan not found' });
        });
};
