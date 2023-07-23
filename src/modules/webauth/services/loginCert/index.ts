import { nemo } from "../..";
import { User, _deviceId, _login, _passportError, _profile } from "../..";

/*****************************************************/
/* ShortHands                                        */
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
const responseError = nemo.responseError;
const events = nemo.events;
/*                                                   */
/*****************************************************/

const loginCert = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{

    if(!request.certificate || !request.certificate?.serialNumber)
        reject(responseError(400,`Invalid certificate`));

    const serialNumber = request.certificate?.serialNumber;

    //const username = fileDB.getValue('certificates', serialNumber);
    User.getByCertificate(serialNumber).then(user=>{
        if(!user){
            reject(responseError(404,`user not found`));
        }else{
            request.session.setValue(_profile, user.toPublicObject());
            events.emit('webauth:auth', request.session.id, user);
            resolve({ status: 'ok',user:user.toPublicObject()});
        }
    });

});

export default loginCert;