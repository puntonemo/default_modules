import { nemo } from "../..";
import * as logic from './logic';

/*****************************************************/
/* ShortHands                                        */
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
const responseError = nemo.responseError;
/*                                                   */
/*****************************************************/

const decodeState = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    if(request.params.state){
        resolve(logic.decodeState(request.params.state))
    }else{
        reject(responseError(400, 'state missing'));
    }
});

export default decodeState;