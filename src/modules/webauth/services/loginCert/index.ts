import { ClientRequest, GenericObject, responseError, events } from 'core';
import User from 'model/User';
import { _deviceId, _login, _passportError, _profile } from "modules/webauth";

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
            events.emit('webauth:auth', request.session.id, user.toPublicObject());
            resolve({ status: 'ok',user:user.toPublicObject()});
        }
    });

});

export default loginCert;