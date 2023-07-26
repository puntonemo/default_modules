import { ClientRequest, GenericObject, responseError } from '../..';
import * as logic from './logic';
import { _deviceId } from "../..";


const getProviderAuthUrl = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
	const {provider, redirect_uri, state, scopes} = request.params;
    const sessionId = request.session.id;
    if(sessionId != null){
        request.session.setValue('remoteAddess', request.remoteAddress);
        request.session.setValue('userAgent', request.headers["user-agent"]);
    }
    request.session.getValue(_deviceId).then(deviceId=>{
        const authUrl = logic.getProviderAuthUrl(provider, redirect_uri, state, scopes, sessionId, deviceId?.toString());
        //https://local.puntonemo.com:4443/api/passport/authUrl/google?state={}&redirect_uri=https://local.puntonemo.com:4443/static
        //https://local.puntonemo.com:4443/api/passport/authUrl/live?state={}&redirect_uri=https://local.puntonemo.com:4443/static
        //https://local.puntonemo.com:4443/api/passport/authUrl/twitter?state={}&redirect_uri=https://local.puntonemo.com:4443/static
        //https://local.puntonemo.com:4443/api/passport/response/google
        if(authUrl!=null){
            //Some devices, like old iPhones are not sending the sec-fetch-mode, so invert the next condition
            //if(request.origin == 'ws' || (request.origin == 'http' && request.headers['sec-fetch-mode'] != 'navigate')){
            if(request.origin == 'http' && request.headers["sec-fetch-mode"] == "cors"){
                const response = {
                    provider,
                    authUrl:authUrl
                }
                resolve(response);
            }else{
                request.redirect(authUrl);
                resolve({});
            }
        }else{
            reject(responseError(500));
        }
    });
})

export default getProviderAuthUrl