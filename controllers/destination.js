const Destination= require('../models/destination');


exports.getDestByCity = (req,res,next)=> {
    const _si = req.body._si;
   
    console.log('ok');
    Destination.getDestinations(_si)
    .then(destinationList=>{
        
        return res.send(destinationList);
    })
    
}

exports.getDestination = (req,res,next)=> {
    const name = req.body.name;
    Destination.getDestinationByName(name)
    .then(destination=> {
        console.log(destination);
        return res.send(destination);
    })
}
