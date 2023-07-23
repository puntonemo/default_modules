import {nemo} from '../..';

const secondService = (request:nemo.ClientRequest):Promise<nemo.GenericObject> => new Promise(async (resolve, reject)=>{
    const {isError} = request.params;
    let response:nemo.GenericObject = {};
    try{
        request.willResolve({message:'In a moment'});
        request.setCookie('secondService', 'called');
        await request.session.setValue('secondService', 'called');
        console.log(await request.session.getValue('secondService'))
        if(!isError){
            request.params.foo = 'localBar';
            request.invokeService('remoteFunc.remoteService').then(async remoteResponse=>{
                resolve({...remoteResponse as nemo.GenericObject, ...{secondService:await request.session.getValue('secondService')}});
            }).catch(error=>{
                reject(nemo.responseError(500,'custom internal error', error));
            })
        }else{
            reject(nemo.responseError(501,'custom internal error'));
        }
    }catch(error){
        reject(nemo.responseError(502))
    }
})

export default secondService;