import { ClientRequest, GenericObject, responseError, events } from 'core';
import User from 'model/User';
import { _profile } from 'modules/webauth';

const loginUser = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    const {username, password} = request.params;
    if (!username || !password) reject(responseError(400, `parameters missing`));

    //let user = fileDB.getValue('users', username);
    User.get(username).then(user=>{
        if(!user){
            reject(responseError(403, `login failed`));
            return;
        }
        if(!user.password){
            reject(responseError(403, `login failed`));
            return;
        }
        if(!user.passwordMatch(password)){
            reject(responseError(403, `login failed`));
            return;
        }
        
        const profile = user.toPublicObject();
        const fullUser = user.toObject();
        request.session.setValue(_profile, profile);
        events.emit('webauth:auth', request.session.id, fullUser);
        resolve ({ 
            status: 'ok',
            user: profile
        });
    
    })
});

export default loginUser;