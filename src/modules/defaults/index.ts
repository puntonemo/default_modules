import { Service, ClientRequest, GenericObject, Response, events } from 'core';
import { renderManager, renderer } from './render';
import path from 'path';

import myService from './services/myService';
import secondService from './services/secondService';
import shutdownService from './services/shutdownService';

export const version = "1.9.4"
export const init = () => {
    /* WEBAUTH COMPATIBILITY 1.9 */
    events.on('webauth:login', (sessionId:string, userString:string)=>{
        const user = typeof userString == 'string' ? JSON.parse(userString) : userString;
        console.log(`WEBAUTH (Remote) : User ${user?.username || 'unknown'} authenticated on session ${sessionId}`);
    })
    events.on('webauth:register', (sessionId:string, userString:string)=>{
        const user = typeof userString == 'string' ? JSON.parse(userString) : userString;
        console.log(`WEBAUTH (Remote) : User ${user?.username || 'unknown'} registered on session ${sessionId}`);
    })
    events.on('webauth:error', (sessionId:string, userString:string, error:string) => {
        const user = typeof userString == 'string' ? JSON.parse(userString) : userString;
        console.log(`WEBAUTH (Remote) : Error authenticating user ${user?.username || 'unknown'} on session ${sessionId} - ${error}`);
    })
}

const myStaticsManager = (request:ClientRequest):Promise<GenericObject> => new Promise(async (resolve, reject)=>{
    try{
        let response:GenericObject = {}
        if(request.params.redirect){
            response.__redirect = request.params.redirect;
        }
        resolve(response);
    }catch(error){
        reject({error});
    }
})
const requestManager = (request:ClientRequest) => {
    //console.log('Service Request Manager'); 
    return request;
}
const defaultResponseManager = (response:GenericObject, _request?:ClientRequest, res?:Response) => {
    
    if(res && response.hasOwnProperty('__redirect')){
        res?.redirect(302,response['__redirect']);

    }
    return response;

}
const emptyResponseManager = (response:GenericObject, _request?:ClientRequest, res?:Response) => {
    
    if(res && response.hasOwnProperty('__redirect')){
        if(res.writable){
            res?.redirect(302,response['__redirect']);
            res.end()
        }
    }

    return undefined;
}


export const Services:Service[] = [
    {
        name: 'defaultsRender',
        get: '/',
        serviceType:'render',
        public:false,
        renderer:renderer, // This option can be removed if a generic renderer is defined
        manager:renderManager
    },
    {
        serviceType:'static',
        use: process.env.STATIC_ROUTE,
        path: path.join(__dirname, process.env.STATIC_PATH || "/")
    },
    {
        name : 'myService',
        get : '/api/1/myService',
        manager : myService,
        serviceType:'json',
        serviceState:'stateful',
        requestManager:requestManager,
        responseManager:defaultResponseManager
    },
    {
        name : 'secondService',
        get : '/api/1/secondService',
        manager:secondService,
        serviceType:'json',
        requestManager:requestManager,
    },
    {
        name : 'shutdown',
        get : '/api/shutdown',
        manager:shutdownService,
        serviceType:'json',
        public:false
    },
    {
        use : '/managedStatic',
        manager:myStaticsManager,
        serviceType:'json',
        responseManager:emptyResponseManager
    },
    {
        name:'TMDBSearchMovie',
        parameters: 'query, language, api_key',
        serviceType:'proxy',
        get:'/api/tmdb/search/movie',
        proxy:{
            target:'https://api.themoviedb.org/3/search/movie',
        }
    }
]