import { core, ClientRequest, GenericObject } from '..';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';

export const renderer =(response:GenericObject, requestLang?:string|string[]) => {
    var lang:string|undefined;
    var responseView = response.view;
    if(response.result=='error') responseView = 'error';
    if(!responseView) responseView = 'default';

    if(typeof requestLang === 'string'){
        lang = requestLang
    };
    if(Array.isArray(requestLang)){
        lang = requestLang[0].substring(0,2).toLowerCase();
    }
    //DEBUG ONLY
    const options = {
        views: [path.join(__dirname, '../views')],
        async: false
    }
    
    try{
        const rfs = fs.readFileSync(path.join(__dirname, '../views', `${responseView}.ejs`), 'utf8');
        const view = ejs.render(rfs, response, options);
        return view;    
    }catch(error){
        return (error as GenericObject).message || error;
    }
}
export const renderManager = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, _reject)=>{
    if(request.params.view=='passport' && request.params.state){
        core.invokeService("passport.decodeState", request).then(async state=>{
            const requestGO = await request.toGenericObject();
            const response = {...{status:200, state, view:request.params.view || 'default'}, ...requestGO}
            if(request.params.view=='passport'){
                if(request.params.state){
                    if(request.session.id == ''){
                        const stateSessionId = (state as GenericObject).state.sessionId;
                        console.log(`\x1b[33mThis request has no session - Trying ${stateSessionId}\x1b[0m`);
                        const stateSession = await core.Session.get(stateSessionId);
                        const stateSessionRemoteAddress = await stateSession.getValue('remoteAddess');
                        const stateSessionUserAgent = await stateSession.getValue('userAgent');
                        
                        if(stateSessionRemoteAddress == request.remoteAddress && stateSessionUserAgent == request.headers['user-agent']){
                            console.log(`\x1b[32mSession ${stateSessionId}seems to be same origin\x1b[0m`);
                            request.setCookie('sid', stateSessionId);
                        }
                    }
                }else{
                    console.log(`\x1b[33mView \x1b[34m'passport'\x1b[33m requires a \x1b[34m'state'\x1b[33m param \x1b[0m`)
                }
            }
            resolve(response);
        }).catch(error=>{
            console.log('passport error', error);
            const response = {...{status:500, view:'passportError', error}}
            resolve(response);
        })
    }else{
        const response = {...{status:200, view:request.params.view || 'default'}, ...request.toGenericObject()}
        resolve(response);
    }
})