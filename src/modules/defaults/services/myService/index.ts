import { ClientRequest, GenericObject, responseError } from '../..';

const myService = (request:ClientRequest):Promise<GenericObject> => new Promise(async (resolve, reject)=>{
    const {isError, redirect} = request.params;
    try{

        if(redirect){
            request.redirect(redirect);
            resolve({});
        }
        if(!isError){
            //nemo.invokeService('remoteService', request).then(remoteResponse=>{
            //    let response:nemo.GenericObject = {
            //        request : request,
            //        version : 'local',
            //        remoteResponse
            //    };
            //    
            //    resolve(response);
            //}).catch(error=>{
            //    reject(error);
            //})
            let response:GenericObject = {
                request : await request.toGenericObject(),
                version : 'local_only'
            };
            resolve(response);
        }else{
            reject(responseError(500,'internal cusom error'));
        }
    }catch(error){
        reject({error});
    }
})

export default myService