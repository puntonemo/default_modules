import  { Service, ClientRequest, GenericObject, events, Session } from 'core';

import path from "path";
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
import {renderManager, renderer} from './render';

export const _profile = 'profile';
export const _login = 'login';
export const _register = 'register';
export const _deviceId = 'deviceId'
export const _passportError = 'passportError';
export const _webauthFlowData = 'webauthFlowData';

export { User, tools };

export const version = "1.9.4"

export const init = () => {
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
                                    events.emit('webauth:auth', sessionId, user.toPublicObject());
                                    console.log(`WEBAUTH : Authenticated by passport on session ${sessionId}`);
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
                            events.emit('webauth:auth', sessionId, user);

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