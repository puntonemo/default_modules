import { nemo } from "../..";
import * as logic from './logic';
import { _deviceId } from "../..";

/*****************************************************/
/* ShortHands                                        */
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
const Session = nemo.Session;
const responseError = nemo.responseError;
const events = nemo.events;
/*                                                   */
/*****************************************************/

const digestProviderResponse = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    logic.digestProviderResponse(request.params).then(async providerResponse=>{
       const sessionId = providerResponse.state.sessionId || request.session.id;
       const session = await Session.get(sessionId);
       await session.setValue('passportAuthProviderResponse', providerResponse);
       events.emit('passportAuth', sessionId, providerResponse);
       //Some devices, like old iPhones are not sending the sec-fetch-mode, so invert the next condition
       //if(request.origin == 'ws' || (request.origin == 'http' && request.headers['sec-fetch-mode'] != 'navigate')){
       if(request.origin == 'http' && request.headers["sec-fetch-mode"] == "cors"){    
           resolve(providerResponse);
       }else{
           request.redirect(providerResponse.state.redirect_uri);
           resolve(providerResponse);
       }
   }).catch(error=>{
       reject(responseError(500,error));
   });
})

export default digestProviderResponse