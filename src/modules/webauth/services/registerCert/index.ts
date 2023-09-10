import { ClientRequest, GenericObject, responseError, events } from 'core';
import User from 'model/User';
import { _deviceId, _login, _passportError, _profile } from "../..";

const registerCert = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    const {username, firstName, lastName} = request.params;
    if (!username) 
        reject(responseError(400, `parameters missing`));
    if(!request.certificate || !request.certificate.serialNumber)
        reject(responseError(400,`Invalid certificate`));
    
    //let user = fileDB.getValue('users', username);
    User.get(username).then(user=>{
        const certSerialNumber = request.certificate?.serialNumber
        if(!user){
            //user = {
            //    'id' : Date.now(),
            //    'username': username,
            //    'firstName': firstName,
            //    'lastName': lastName,
            //    'password' : undefined,
            //    'authenticators': [],
            //    'certificates' : [certSerialNumber],
            //};
            //fileDB.setValue('certificates', certSerialNumber, username);
            user = new User(
                0,
                username,
                firstName,
                lastName,
                undefined
            ).addCertificate(certSerialNumber);
            events.emit('webauth:new-certificate', request.session.id, certSerialNumber, username);
        }else{
            //if(!user.certificates) user.certificates = [];
            //const certificateFound = user.certificates.find((cred:string)=>cred == certSerialNumber);
            const certificateFound = user.findCertificate(certSerialNumber);
            if(!certificateFound){
                
                //user.certificates.push(certSerialNumber)
                //fileDB.setValue('certificates', certSerialNumber, username);
                user.addCertificate(certSerialNumber);
                events.emit('webauth:new-certificate', request.session.id, certSerialNumber, username);
            }else{
                //Certificate already registered
            }
        }
        //fileDB.setValue('users', username, user);     
        request.session.setValue(_profile, user.toPublicObject());
        events.emit('webauth:auth', request.session.id, user);
        resolve({ status: 'ok', user: user.toPublicObject()})
    })
});

export default registerCert;