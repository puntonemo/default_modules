import { ClientRequest, GenericObject, responseError, events } from 'core';
import { _deviceId, _login, _passportError, _profile } from "modules/webauth";
import User from 'model/User';
import * as tools from 'modules/webauth/tools';

const registerUser = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    const {username, firstName, lastName, password} = request.params;

    if (!username || !firstName || !lastName || !password) reject(responseError(400,`parameters missing`));
    
    User.get(username).then(user=>{
        if(user){
            reject(responseError(400,`Username already exists`));
        }else{   
            //let newUser = {
            //    'id' : Date.now(),
            //    'username': username,
            //    'name' : name,
            //    'password' : hashPassword(password, HASH_SALT),
            //    'credentials': [],
            //};
            //Create a new user
            user = new User(
                0,
                username,
                firstName,
                lastName,
                tools.hashPassword(password, tools.HASH_SALT)
            );
            //fileDB.setValue('users', username, newUser);
            events.emit('webauth:new-user', request.session.id, username);
            request.session.setValue(_profile, user.toPublicObject());
            events.emit('webauth:auth', request.session.id, user.toPublicObject());
            resolve({ status: 'ok', user:user.toPublicObject()});
        }
    })
});

export default registerUser;