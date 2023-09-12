import { ClientRequest, GenericObject } from 'core';
import { _profile } from "modules/webauth";

const logout = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve)=>{
    const {redirect_uri} = request.params;   
    request.session.delValue(_profile);
    if(redirect_uri) request.redirect(redirect_uri);
    resolve({status:'ok'})
});

export default logout;