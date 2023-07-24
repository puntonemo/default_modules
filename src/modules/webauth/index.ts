import { nemo } from '../..';
import path from "path";
import fs from 'fs';
import ejs from 'ejs';

import * as tools from './tools';
import User from '../../model/User';

import registerUser from './services/registerUser';
import loginUser from './services/loginUser';
import getCertificateInfo from './services/getCertificateInfo';
import registerCert from './services/registerCert';
import loginCert from './services/loginCert';
import getChallenge from './services/getChallenge';
import setCredential from './services/setCredential';
import getUserProfile from './services/getUserProfile';
import logout from './services/logout';

/*****************************************************/
/* ShortHands                                        */
type Service = nemo.Service;
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
const events = nemo.events;
const Session = nemo.Session;
const invokeService = nemo.invokeService;
export { nemo };
/*                                                   */
/*****************************************************/

export const _profile = 'profile';
export const _login = 'login';
export const _register = 'register';
export const _deviceId = 'deviceId'
export const _passportError = 'passportError';
export const _webauthFlowData = 'webauthFlowData';

export { User, tools };

export const init = () => {
    console.log('WEBAUTH Module v.1.9.1');

    /**
     * COMPATIBILITY WITH PASSPORT
     */
    events.on('passportAuth', (sessionId:string, providerResponse:GenericObject) =>{
        Session.get(sessionId).then(session=>{
            session.getValue(_deviceId).then(deviceId=>{
                if(deviceId == providerResponse.state.deviceId){
                    //delete session.passportError;
                    session.delValue(_passportError)
                    //const user = fileDB.getValue('users', providerResponse.profile.email);
                    User.get(providerResponse.profile.email).then(user=>{
                        if(user){
                            if(providerResponse.state.data == _login){
                                if(user.getProviderId(providerResponse.profile.provider) == providerResponse.profile.id){
                                    session.setValue(_profile, user.toPublicObject());
                                    events.emit('webauth:login', sessionId, user);
                                    console.log(`WEBAUTH : Authenticated (login) by passport on session ${sessionId}`);
                                }else{
                                    console.log('WEBAUTH : ACCOUNT NOT REGISTERED (1)');
                                    session.delValue(_profile);
                                    events.emit('webauth:error', sessionId, user.toPublicObject(), 'account-not-registered');
                                    session.setValue(_passportError, 'account-not-registered');
                                }
                            }
                            if(providerResponse.state.data == _register){
                                user.setProviderId(providerResponse.profile.provider, providerResponse.profile.id);
                                session.setValue(_profile, user.toPublicObject());
                                events.emit('webauth:register', sessionId, user);
                                console.log(`WEBAUTH : Authenticated (register) by passport on session ${sessionId}`);
                            }
                        }else{
                            user = new User(0, providerResponse.profile.email, providerResponse.profile.firstName, providerResponse.profile.lastName, undefined, providerResponse.profile.picture, providerResponse.profile.provider, providerResponse.profile.id);
                            session.setValue(_profile,  user.toPublicObject());
                            events.emit('webauth:register', sessionId, user);
                        }
                    })
                }
            })
        })
    })
    events.on('webauth:auth', (sessionId:string, user:User)=>{
        console.log(`WEBAUTH : User ${user.username} authenticated on session ${sessionId}`);
    })
}

const renderManager = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, _reject)=>{
    if(request.params.view=='passport' && request.params.state){
        invokeService("passport.decodeState", request).then(async state=>{
            const requestGO = await request.toGenericObject();
            const response = {...{status:200, state, view:request.params.view || 'default'}, ...requestGO}
            if(request.params.view=='passport'){
                if(request.params.state){
                    if(request.session.id == ''){
                        const stateSessionId = (state as GenericObject).state.sessionId;
                        console.log(`\x1b[33mThis request has no session - Trying ${stateSessionId}\x1b[0m`);
                        const stateSession = await Session.get(stateSessionId);
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
});
const renderer =(response:GenericObject, requestLang?:string|string[]) => {
    var lang:string|undefined;
    var view = response.view || 'default'
    if(typeof requestLang === 'string'){
        lang = requestLang
    };
    if(Array.isArray(requestLang)){
        lang = requestLang[0].substring(0,2).toLowerCase();
    }
    //DEBUG ONLY
    const options = {
        views: [path.join(__dirname, './views')],
        async: false
    }

    try{
        const rfs = fs.readFileSync(path.join(__dirname, './views', `${response.view}.ejs`), 'utf8');
        const view = ejs.render(rfs, response, options);
        return view;    
    }catch(error){
        return (error as GenericObject).message || error;
    }
}
export const Services:Service[] = [
    {
        name: "registerUser",
        post : "/api/webauth/user",
        manager:registerUser,
        serviceType:'json'
    },
    {
        name: "loginUser",
        put : "/api/webauth/user",
        manager:loginUser,
        serviceType:'json'
    },
    {
        name: "getCertificateInfo",
        get : "/api/webauth/cert",
        manager:getCertificateInfo,
        requestCert: true,
        serviceType:'json'
    },
    {
        name: "registerCert",
        post : "/api/webauth/cert",
        manager:registerCert,
        requestCert: true,
        serviceType:'json'
    },
    {
        name: "loginCert",
        put : "/api/webauth/cert",
        manager:loginCert,
        requestCert: true,
        serviceType:'json'
    },
    {
        name: "getChallenge",
        get : "/api/webauth/challenge",
        manager:getChallenge,
        serviceType:'json'
    },
    {
        name: "setCredential",
        post : "/api/webauth/credential",
        manager:setCredential,
        serviceType:'json'
    },
    {
        name: "getUserProfile",
        get : "/api/webauth/profile",
        manager:getUserProfile,
        serviceType:'json'
    },
    {
        name: "logout",
        get : "/api/webauth/logout",
        manager:logout,
        serviceType:'json'
    },
    {
        name:'staticPath',
        serviceType: 'static',
        use: '/static/webauth',
        path: path.join(__dirname, '/static'),
        manager:async (_request:ClientRequest) => {
            return {}
        }
    },
    {
        name: 'render',
        get: '/webauth/:view?',
        serviceType: 'render',
        public:false,
        serviceState:'stateless',
        renderer:renderer,
        manager:renderManager
    },
]