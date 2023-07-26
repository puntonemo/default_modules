import { ClientRequest, GenericObject, responseError } from '../..';

const secondService = (request:ClientRequest):Promise<GenericObject> => new Promise(async (resolve, reject)=>{
    const {isError} = request.params;
    let response:GenericObject = {};
    try{
        request.willResolve({message:'In a moment'});
        request.setCookie('secondService', 'called');
        await request.session.setValue('secondService', 'called');
        console.log(await request.session.getValue('secondService'))
        if(!isError){
            request.params.foo = 'localBar';
            request.invokeService('remoteFunc.remoteService').then(async remoteResponse=>{
                resolve({...remoteResponse as GenericObject, ...{secondService:await request.session.getValue('secondService')}});
            }).catch(error=>{
                reject(responseError(500,'custom internal error', error));
            })
        }else{
            reject(responseError(501,'custom internal error'));
        }
    }catch(error){
        reject(responseError(502))
    }
})

export default secondService;