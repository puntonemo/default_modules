import { ClientRequest, GenericObject } from '..';
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
    request.toGenericObject().then(requestObject=>{
        const response = {...{status:200, view:request.params.view || 'index'}, ...requestObject}
        resolve(response);
    })
})