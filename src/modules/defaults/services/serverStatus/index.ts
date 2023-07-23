import {nemo} from '../..';

const serverStatus = (request:nemo.ClientRequest):Promise<nemo.GenericObject> => new Promise(async (resolve, _reject)=>{
    request.willResolve({status:'wip'});
    
    console.log(nemo.ServerConnection.remoteServers.size);

    setTimeout(()=>{
        resolve({status:'ok'});
    })
        

});

export default serverStatus;        