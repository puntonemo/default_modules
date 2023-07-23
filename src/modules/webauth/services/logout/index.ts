import { nemo } from "../..";
import { _profile } from "../..";

/*****************************************************/
/* ShortHands                                        */
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
/*                                                   */
/*****************************************************/

const logout = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve)=>{
    const {redirect_uri} = request.params;   
    request.session.delValue(_profile);
    if(redirect_uri) request.redirect(redirect_uri);
    resolve({status:'ok'})
});

export default logout;