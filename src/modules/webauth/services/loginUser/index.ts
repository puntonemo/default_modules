import { nemo } from "../..";
import { User, tools, _deviceId, _login, _passportError, _profile } from "../..";

/*****************************************************/
/* ShortHands                                        */
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
const responseError = nemo.responseError;
const events = nemo.events;
/*                                                   */
/*****************************************************/

const loginUser = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    const {username, password} = request.params;
    if (!username || !password) reject(responseError(400, `parameters missing`));

    //let user = fileDB.getValue('users', username);
    User.get(username).then(user=>{
        if(!user){
            reject(responseError(403, `login failed`));
        }else{
            if(!user.password){
                reject(responseError(403, `login failed`));
            }else{
                if(!(tools.hashPassword(password, tools.HASH_SALT) === user.password)){
                    reject(responseError(403, `login failed`));
                }else{
                    request.session.setValue(_profile, user.toPublicObject());
                    events.emit('webauth:auth', request.session.id, user);
                    resolve ({ 
                        status: 'ok',
                        user: user.toPublicObject()
                    });
                }
            }
        }
    })
});

export default loginUser;