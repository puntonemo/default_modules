import { ClientRequest, GenericObject, responseError, events } from 'core';
import { User, tools, _webauthFlowData } from "../..";

const getChallenge = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    const {username, firstName, lastName} = request.params;

    //const user = fileDB.getValue('users', username);
    User.get(username).then(user=>{
        try{
            const webauthFlowData = {
                challenge : tools.randomBase64URLBuffer(32),
                origin: process.env.WEBAUTH_ORIGIN,
                username,
                firstName : user?.firstName || firstName,
                lastName : user?.lastName || lastName,
                userId : user?.id,
                credentials : user?.credentials || [],
                remoteAddress: request.remoteAddress
            }
            
            //request.session.webauthFlowData = webauthFlowData;
            request.session.setValue(_webauthFlowData, webauthFlowData).then(()=>{
                resolve({
                    challenge : webauthFlowData.challenge,
                    username : username,
                    credentials : user?.credentials ?? []
                });
            })
            
        }catch(error){
            reject(responseError(500, error));
            events.emit('webauth:error', request.session.id, 'getChallenge:error');
        }
    });
})

export default getChallenge;