import { nemo } from '../..';
import path from 'path';
import fs from 'fs';
import ejs from 'ejs';
export { nemo };

import myService from './services/myService';
import secondService from './services/secondService';
import shutdownService from './services/shutdownService';
import serverStatus from './services/serverStatus';

const myStaticsManager = (request:nemo.ClientRequest):Promise<nemo.GenericObject> => new Promise(async (resolve, reject)=>{
    try{
        let response:nemo.GenericObject = {}
        if(request.params.redirect){
            response.__redirect = request.params.redirect;
        }
        resolve(response);
    }catch(error){
        reject({error});
    }
})
const requestManager = (request:nemo.ClientRequest) => {
    console.log('Service Request Manager'); 
    return request;
}
const defaultResponseManager = (response:nemo.GenericObject, _request?:nemo.ClientRequest, res?:nemo.Response) => {
    
    if(res && response.hasOwnProperty('__redirect')){
        res?.redirect(302,response['__redirect']);

    }
    return response;

}
const emptyResponseManager = (response:nemo.GenericObject, _request?:nemo.ClientRequest, res?:nemo.Response) => {
    
    if(res && response.hasOwnProperty('__redirect')){
        if(res.writable){
            res?.redirect(302,response['__redirect']);
            res.end()
        }
    }

    return undefined;
}
const renderer =(response:nemo.GenericObject, requestLang?:string|string[]) => {
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
        return (error as nemo.GenericObject).message || error;
    }
}
const renderManager = (request:nemo.ClientRequest):Promise<nemo.GenericObject> => new Promise((resolve, _reject)=>{
    request.toGenericObject().then(requestObject=>{
        const response = {...{status:200, view:request.params.view || 'index'}, ...requestObject}
        resolve(response);
    })
})

export const Services:nemo.Service[] = [
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
        name : 'serverStatus',
        get : '/api/serverStatus',
        manager:serverStatus,
        serviceType:'json'
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


export const init = () => {
    console.log('Defaults Module v.1.9');

    /* WEBAUTH COMPATIBILITY 1.8 */
    nemo.events.on('webauth:login', (sessionId:string, userString:string)=>{
        const user = typeof userString == 'string' ? JSON.parse(userString) : userString;
        console.log(`WEBAUTH (Remote) : User ${user.username} authenticated on session ${sessionId}`);
    })
    nemo.events.on('webauth:register', (sessionId:string, userString:string)=>{
        const user = typeof userString == 'string' ? JSON.parse(userString) : userString;
        console.log(`WEBAUTH (Remote) : User ${user.username} registered on session ${sessionId}`);
    })
    nemo.events.on('webauth:error', (sessionId:string, userString:string, error:string) => {
        const user = typeof userString == 'string' ? JSON.parse(userString) : userString;
        console.log(`WEBAUTH (Remote) : Error authenticating user ${user.username} on session ${sessionId} - ${error}`);
    })
}
