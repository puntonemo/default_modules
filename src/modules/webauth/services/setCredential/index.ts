import { nemo } from "../..";
import { User, _profile, _webauthFlowData } from "../..";
import * as base64url from 'base64url';
/*****************************************************/
/* ShortHands                                        */
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
const responseError = nemo.responseError;
const events = nemo.events;
/*                                                   */
/*****************************************************/

const validateClientData = (credential:GenericObject, webauthFlowData:GenericObject, remoteAddress:string|string[]|undefined) => {
    let validated = true;
    let clientDataObj;
    if(credential.clientData && webauthFlowData.challenge && webauthFlowData.origin){
        const decodedClientData = base64url.default.decode(credential.clientData);
        clientDataObj = JSON.parse(decodedClientData);
        if(clientDataObj.challenge != webauthFlowData.challenge) validated = false;
        if(clientDataObj.origin != webauthFlowData.origin) validated = false;
        if(clientDataObj.type != "webauthn.create" && clientDataObj.type != "webauthn.get") validated = false;
        if(webauthFlowData.remoteAddress != remoteAddress) validated = false;
    }else{
        validated = false;
        clientDataObj = {}
    }

    return {validated, clientDataObj};
}

const setCredential = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    if(request.params){
        request.session.getValue(_webauthFlowData).then((webauthFlowDataSessionValue)=>{
            const webauthFlowData = webauthFlowDataSessionValue as GenericObject;
            const validation = validateClientData(request.params, webauthFlowData, request.remoteAddress);
            let credentialFound;
            if(validation.validated){
                //delete request.session.webauthFlowData;
                request.session.delValue(_webauthFlowData);
                const credentialId = request.params.credential?.id ?? request.params.credentialId;
                //let user:User;
                let username;
                if(webauthFlowData.username){
                    //user = fileDB.getValue('users', webauthFlowData.username);
                    //user = User.get(webauthFlowData.username);
                    username = webauthFlowData.username;
                }else{
                    //const credentialUser = fileDB.getValue('credentials', credentialId);
                    User.usernameByCredential(credentialId).then(credentialUser=>{
                        if(credentialUser){
                            //user = fileDB.getValue('users', credentialUser);
                            //user = User.get(credentialUser);
                            username = credentialUser;
                        }else{
                            events.emit('webauth:error', request.session.id, 'setCredential:credential-not-found');
                            reject(responseError(401, 'Credential not found'));
                        }
                    })
                }
                User.get(username).then(user=>{
                    switch(validation.clientDataObj.type){
                        case "webauthn.create":
                            let userExists = user ? true : false;
                            if(!user){
                                user = new User(
                                    0,
                                    webauthFlowData.username,
                                    webauthFlowData.firstName,
                                    webauthFlowData.lastName,
                                    undefined
                                );
                                //user = {
                                //    id : Date.now(),
                                //    username: webauthFlowData.username,
                                //    name : webauthFlowData.name,
                                //    credentials : []
                                //}
                                //fileDB.setValue('users', webauthFlowData.username, user);
                                events.emit('webauth:new-user', request.session.id, webauthFlowData.username);
                            }else{
                                //credentialFound = user.credentials.find((cred:string)=>cred == credentialId);
                                credentialFound = user.findCredential(credentialId);
                                if(credentialFound){
                                    events.emit('webauth:error', request.session.id, 'setCredential:credential-already-exists');
                                    reject(responseError(400, 'Credential already registered'));
                                }
                            }
                            if(!userExists){
                                // Es una cuenta nueva que se está registrando. Agregar la credencial al nuevo usuario
                                //user.credentials.push(credentialId);
                                user.addCredential(credentialId);
                                //fileDB.setValue('users', webauthFlowData.username, user);
                                //fileDB.setValue('credentials', credentialId, webauthFlowData.username);
                                events.emit('webauth:new-credential', request.session.id, credentialId, webauthFlowData.username);
                                resolve({
                                    status:'ok'
                                });
                            }else{
                                //Cuando se agrega una credencial nueva a un usuario existente, se debe veritificar al usuario (p.e. enviadonle un email con un código unico)
                                request.session.getValue('profile').then(profileSessionValue=>{
                                    const profile = profileSessionValue as GenericObject;
                                    if(profile.username == webauthFlowData.username){
                                        //Se está agregando una credencial con una cuenta de sesión iniciada. Comprobar que el usuario es el mismo y agregar la
                                        user?.addCredential(credentialId);
                                        //user.credentials.push(credentialId);
                                        //fileDB.setValue('users', webauthFlowData.username, user);
                                        //fileDB.setValue('credentials', credentialId, webauthFlowData.username);
                                        events.emit('webauth:new-credential', request.session.id, credentialId, webauthFlowData.username);
                                        resolve({
                                            status:'ok'
                                        });
                                    }else{
                                        //Se está agregando una credencial sin iniciar sesión previamente. 
                                        reject(responseError(403, 'User profile required'));
                                    }
                                })
                            }
                            break;
                        case "webauthn.get":
                            if(!user){
                                reject(responseError(401, 'User not found'));
                            }else{
                                //credentialFound = user.credentials ? user.credentials.find((cred:string)=>cred == credentialId) : false;
                                credentialFound = user?.findCredential(credentialId)
                                if(credentialFound){
                                    //request.session.profile = user.toPublicObject();
                                    request.session.setValue(_profile, user.toPublicObject())
                                    events.emit('webauth:auth', request.session.id, user);
                                    resolve(user.toPublicObject())
                                }else{
                                    reject(responseError(403, 'Invalid ClientialId'));
                                }
                            }
                            break;
                        default:
                            events.emit('webauth:error', request.session.id, 'setCredential:invalid-clientDataType');
                            reject(responseError(400));
                    }
                })
            }else{
                events.emit('webauth:error', request.session.id, 'setCredential:invalid-clientData');
                reject(responseError(403, 'Invalid ClientData'));
            }
        })
    }else{
        events.emit('webauth:error', request.session.id, 'setCredential:clientData-not-validated');
        reject(responseError(400));
    }

});

export default setCredential;