import { ClientRequest, GenericObject } from 'core';

const shutdownService = (_request:ClientRequest):Promise<GenericObject> => new Promise(async (resolve, _reject)=>{
    resolve({status:'ok'});
    setTimeout(()=>{
        process.abort();
    }, 2000)
})

export default shutdownService;