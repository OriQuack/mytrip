const Destination = require('../models/destination');

exports.getDestByCity = (req, res, next) => {
    const _si = req.params.region;

    console.log('ok');
    Destination.getDestinations(_si)
        .then((destinationList) => {
            if (destinationList) return res.status(200).json({ destinationList: destinationList });
            else return res.status(404).json({ message: 'No such destination' });
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Interner server error' });
        });
};

exports.getDestination = (req, res, next) => {
    const name = req.params.destination;
    Destination.getDestinationByName(name)
        .then((destination) => {
            if (destination) {
                console.log(destination);
                return res.status(200).json({ destination: destination });
            } else {
                return res.status(404).json({ message: 'destination not found' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ message: 'Interner server error' });
        });
};
