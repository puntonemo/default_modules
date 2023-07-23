import {nemo} from '../..';

const shutdownService = (_request:nemo.ClientRequest):Promise<nemo.GenericObject> => new Promise(async (resolve, _reject)=>{
    resolve({status:'ok'});
    setTimeout(()=>{
        process.abort();
    }, 2000)
})

export default shutdownService;