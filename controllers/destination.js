const Destination= require('../models/destination');


exports.getDestByCity = (req,res,next)=> {
    const _si = req.body._si;
   
    console.log('ok');
    Destination.getDestinations(_si)
    .then(destinationList=>{
        if(destinationList)
            return res.send(destinationList);
        else
            return res.status(404).json({message: 'no such destination'});
    })
    
}

exports.getDestination = (req,res,next)=> {
    const name = req.body.name;
    Destination.getDestinationByName(name)
    .then(destination=> {
        if(destination){
        console.log(destination);
        return res.send(destination);}
        else
            return res.status(404).json({message: 'destination not found'});
    })
}
