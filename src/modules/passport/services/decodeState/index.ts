import { ClientRequest, GenericObject, responseError } from '../..';
import * as logic from './logic';


const decodeState = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    if(request.params.state){
        resolve(logic.decodeState(request.params.state))
    }else{
        reject(responseError(400, 'state missing'));
    }
});

export default decodeState;