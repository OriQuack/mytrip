const Plan = require('../models/plan');

exports.getIndex = (req, res, next) => {
    res.send('<h1>Main</h1>');
};

exports.getProtected = (req, res, next) => {
    res.send(`This is ${req.user.username}`);
};

exports.postAddPlan = (req, res, next) => {
    const plan = new Plan({
        name: req.body.name,
        ownerId: req.user._id,
        city: req.body.city,
        date: req.body.date,
        period: req.body.period,
        season: req.body.season,
        totalCost: req.body.totalCost,
        isPublic: req.body.isPublic,
        schedule: req.body.schedule,
    });
    plan.save()
        .then((result) => {
            // TODO: User 에 planId 추가
            // TODO: City 에 planId 추가
            return res.status(201).json({ planId: result.insertedId });
        })
        .catch((err) => {
            return res.status(400).json({ message: 'Bad request' });
        });
};

exports.getShareUri = (req, res, next) => {
    
};
