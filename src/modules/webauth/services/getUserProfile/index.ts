import { ClientRequest, GenericObject, responseError } from 'core'
import User from 'model/User';
import { _profile } from "modules/webauth";

const getUserProfile = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    request.session.getValue(_profile).then(profileSessionValue=>{
        const profile = profileSessionValue as GenericObject;
        if(profile){
            User.get(profile.username).then(user=>{
                if(user) resolve(user?.toPublicObject())
                if(!user) reject(responseError(404,'user not found'));
            })
        }else{
            reject(responseError(403));
        }
    })
});

export default getUserProfile;