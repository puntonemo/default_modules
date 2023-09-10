import { GenericObject, fetch } from 'core';
import { encrypt, decrypt } from "../../tools";

type StandarizedUserProfile = {
    id:string,
    firstName:string,
    lastName:string,
    displayName:string,
    email?:string,
    username:string,
    picture:string|null,
    provider?:string
}

export const digestProviderResponse = async (request:GenericObject) => {
    //var socketId;
    //var redirect_uri = '';
    var state = request.state;
    if(request.state){
        state=decrypt(request.state);
        if (state!=null){
            state = JSON.parse(state);
            //redirect_uri = state.redirect_uri;
            //socketId = state.socketId;
        }
    }
    switch(request.provider){
        case 'google':
            try{
                const token = await getGoogleTokens(request.code);
                const profile = await getUserProfile(token as GenericObject);
                const providerResponse = {profile, state};
                if(providerResponse.state?.redirect_uri){
                    const uriArgumentsChar = providerResponse.state.redirect_uri.toString().indexOf('?') == -1 ? '?' : '&';
                    providerResponse.state.redirect_uri = `${providerResponse.state.redirect_uri}${uriArgumentsChar}state=${encrypt(JSON.stringify(providerResponse))}`;
                }
                return providerResponse;
            }catch(error){
                //const response = {
                //    result: 'error',
                //    state: state,
                //    provider: request.provider,
                //    error: error
                //}
                //if(socketId){
                //    authSocket({socketId, token:null})
                //}
                throw error;
            }
            break;
        
        case 'twitter':
            try{
                const token = await getTwitterTokens(request.code);
                const profile = await getUserProfile(token as GenericObject);
                const providerResponse = {profile, state};
                if(providerResponse.state?.redirect_uri){
                    const uriArgumentsChar = providerResponse.state.redirect_uri.toString().indexOf('?') == -1 ? '?' : '&';
                    providerResponse.state.redirect_uri = `${providerResponse.state.redirect_uri}${uriArgumentsChar}state=${encrypt(JSON.stringify(providerResponse))}`;
                }
                return providerResponse;
            }catch(error){
                //const response = {
                //    result: 'error',
                //    state: state,
                //    provider: request.provider,
                //    error: error
                //}
                //if(socketId){
                //    authSocket({socketId, token:null})
                //}
                throw error;
            }
            break;
        case 'live':
            try{
                const token = await getLiveTokens(request.code);
                const profile = await getUserProfile(token as GenericObject);
                const providerResponse = {profile, state};
                if(providerResponse.state?.redirect_uri){
                    const uriArgumentsChar = providerResponse.state.redirect_uri.toString().indexOf('?') == -1 ? '?' : '&';
                    providerResponse.state.redirect_uri = `${providerResponse.state.redirect_uri}${uriArgumentsChar}state=${encrypt(JSON.stringify(providerResponse))}`;
                }
                return providerResponse;
            }catch(error){
                //const response = {
                //    result: 'error',
                //    state: state,
                //    provider: request.provider,
                //    error: error
                //}
                //if(socketId){
                //    authSocket({socketId, token:null})
                //}
                throw error;
            }
            break;
        /*
        case 'facebook':
            try{
                console.log(request);
                //const token = await getFacebookTokens({code:request.code, challenge:'nemojs'});
                //console.log('token', token);
                //const profile = await getUserProfile({token});
                //return {profile, state};
                return {profile:undefined, state};
            }catch(error){
                //const response = {
                //    result: 'error',
                //    state: state,
                //    provider: request.provider,
                //    error: error
                //}
                //if(socketId){
                //    authSocket({socketId, token:null})
                //}
                throw error;
            }
            break;
        case 'nemo':
            console.log('authProviderService: THIS IS NOT IMPLEMENTED!!!!')
            console.log(request);
            break;
        */
            default:
            console.log('authProviderService: Bad provider!!!');
            console.log(request);
            //Bad provider
            throw "bad provider!"

    }
}

const getGoogleTokens = (code:string) => 
    new Promise((resolve, reject)=>{
        const provider = 'google';
        if(!process.env.GOOGLE_CLIENT_ID)
            reject(undefined);
    
        //https://developers.google.com/identity/protocols/oauth2/web-server#httprest
        //https://console.cloud.google.com/apis/credentials?folder=&organizationId=&project=openbox-160812
        const data = {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${ process.env.REDIRECT_URI_BASE}${ process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
            grant_type: 'authorization_code',
            code:code,
        }
        fetch({
            method: 'POST',
            url: 'https://oauth2.googleapis.com/token',
            data: data
        }).then(response=>{
            response.provider = 'google';
            resolve(response);
        }).catch(error=>{
            var errorResponse = {   
                result  : "error",
                code    : 500,
                message : "Internal Error"
            };
            if(error){
                if(error.response){               
                    errorResponse.code = error.response.status;
                    errorResponse.message = error.response.statusText;
                    if(error.response.data){
                        error.response.data.code = error.response.status;
                        error.response.data.provider = 'google';
                        errorResponse.message = JSON.stringify(error.response.data);
                        reject(errorResponse);
                    }else{

                        reject(errorResponse);
                    }
                }else{
                    reject(errorResponse);
                }
            }
        });
    });
const getLiveTokens = (code:string) => 
    new Promise((resolve, reject)=>{
        const provider = 'live';
        //https://console.cloud.google.com/apis/credentials?folder=&organizationId=&project=openbox-160812
        const data = {
            client_id: process.env.LIVE_CLIENT_ID || "",
            client_secret: process.env.LIVE_CLIENT_SECRET || "",
            redirect_uri : `${process.env.REDIRECT_URI_BASE}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
            grant_type: process.env.LIVE_GRANT_TYPE || "",
            /*
            scope: [
                'https://ads.microsoft.com/msads.manage',
                'openid',
                'offline_access',
            ],*/
            code:code,
        }
        const url = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
        fetch({
            method: 'POST',
            url: url,
            data: new URLSearchParams(data).toString()
        }).then(response=>{
            response.provider = 'live';
            resolve(response);
        }).catch(error=>{
            var errorResponse = {   
                result  : "error",
                code    : 500,
                message : "Internal Error"
            };
            if(error){
                if(error.response){               
                    errorResponse.code = error.response.status;
                    errorResponse.message = error.message;
                    if(error.response.data){
                        error.response.data.code = error.response.status;
                        error.response.data.provider = 'live';
                        errorResponse.message = JSON.stringify(error.response.data);
                        reject(errorResponse);
                    }else{
                        reject(errorResponse);
                    }
                }else{
                    reject(errorResponse);
                }
            }
        });
    });
const getTwitterTokens = (code:string) => 
    new Promise((resolve, reject)=>{
        const provider = 'twitter';
        if(!process.env.TWITTER_CLIENT_ID)
            reject(undefined);
        
        //https://developers.google.com/identity/protocols/oauth2/web-server#httprest
        //https://console.cloud.google.com/apis/credentials?folder=&organizationId=&project=openbox-160812
        const data = {
            client_id     : process.env.TWITTER_CLIENT_ID,
            redirect_uri  : `${process.env.REDIRECT_URI_BASE}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
            grant_type    : 'authorization_code',
            code_verifier : process.env.TWITTER_CODE_CHALLENGE,
            code          : code
        }
        fetch({
            method: 'POST',
            url: 'https://api.twitter.com/2/oauth2/token',            
            data: data
        }).then(response=>{
            response.provider = 'twitter';
            resolve(response);
        }).catch(error=>{
            var errorResponse = {   
                result  : "error",
                code    : 500,
                message : "Internal Error"
            };
            if(error){
                if(error.response){               
                    errorResponse.code = error.response.status;
                    errorResponse.message = error.response.statusText;
                    if(error.response.data){
                        console.log(1);
                        error.response.data.code = error.response.status;
                        error.response.data.provider = 'twitter';
                        errorResponse.message = JSON.stringify(error.response.data);
                        console.log(errorResponse)
                        reject(errorResponse);
                    }else{
                        console.log(2);
                        console.log(errorResponse)
                        reject(errorResponse);
                    }
                }else{
                    reject(errorResponse);
                }
            }
        });
        
    });
const getUserProfile = (token:GenericObject) =>
    new Promise((resolve, reject)=>{
        //console.log('getUserProfile->%o', token.provider);
        switch(token.provider){
            case 'google':
                getGoogleProfile(token).then(profile=>{
                    resolve(standarizeUserProfile(profile as GenericObject));
                }).catch(error=>{
                    reject(error);
                });
                break;
            
            case 'live':
                getLiveProfile(token).then(profile=>{
                    resolve(standarizeUserProfile(profile as GenericObject));
                }).catch(error=>{
                    reject(error);
                });
                break;
            
            case 'twitter':
                getTwitterProfile(token).then(profile=>{
                    resolve(standarizeUserProfile(profile as GenericObject));
                }).catch(error=>{
                    reject(error);
                });
                break;
            /*
            case 'facebook':
                getFacebookProfile({token}).then(profile=>{
                    resolve(standarizeUserProfile(profile));
                }).catch(error=>{
                    reject(error);
                });
                break;
            case 'nemo':
            default:
                getNemoProfile({token}).then(profile=>{
                    resolve(standarizeUserProfile(profile));
                }).catch(error=>{
                    reject(error);
                });
                break;
            */
            default:
                reject("unknown-provider");
                break;
        }
    });
const getGoogleProfile = (token:GenericObject) => 
    new Promise((resolve, reject)=>{
        fetch({
            method: 'GET',
            url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token.access_token}`,
            headers: {
                Authorization: `Bearer ${token.id_token}`
            }
        }).then(response=>{
            var profile = response;
            profile.provider = 'google';
            resolve(profile);
        }).catch(error=>{
            reject(error.response);
        })
    });
const getTwitterProfile = (token:GenericObject) => 
    new Promise((resolve, reject)=>{
        let userFields = process.env.TWITTER_USER_FIELDS;
        let url = `https://api.twitter.com/2/users/me`;
        if(userFields) url+=`?user.fields=${userFields}`;
        fetch({
            method: 'GET',
            url,
            headers: {
                Authorization: `Bearer ${token.access_token}`
            }
        }).then(response=>{
            var profile = response.data;
            profile.provider = 'twitter';
            resolve(profile);
        }).catch(error=>{
            reject(error.response);
        })
    });
const getLiveProfile = (token:GenericObject) => 
    new Promise((resolve, reject)=>{
        fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${token.access_token}`
            }
        }).then((response) => {
            var profile = response;
            profile.provider = 'live';
            resolve(profile);
        }).catch((error) => {
            var errorResponse;
            if(error.response){
                if(error.response.data){
                    if(error.response.data.error){
                        //console.error('error.response.data.error %o', error.response.data.error);
                        errorResponse = error.response.data.error;
                    }else{
                        //console.error('error.response.data %o', error.response.data);
                        errorResponse = error.response.data;
                    }
                }else{
                    //console.error('error.response %o', error.response);
                    errorResponse = error;
                }
            }else{
                //console.error('error %o', error.response);
                errorResponse = error;
            }
            
            reject(errorResponse);
        })

    });
const standarizeUserProfile = (profile:GenericObject) => {
        var standardProfile:StandarizedUserProfile;

        switch(profile.provider){
            case 'google':
                standardProfile = {
                    id: profile.id,
                    firstName : profile.given_name,
                    lastName : profile.family_name,
                    displayName: profile.name,
                    email: profile.email,
                    username: profile.email,
                    picture: profile.picture,
                    provider: profile.provider
                }
                break;
            case 'live':
                standardProfile = {
                    id: profile.id,
                    firstName : profile.givenName,
                    lastName : profile.surname,
                    displayName: profile.displayName,
                    email: profile.userPrincipalName,
                    username: profile.userPrincipalName,
                    picture: null,
                    provider: profile.provider
                }
                break;
            case 'facebook':
                standardProfile = {
                    id: profile.id,
                    firstName : profile.first_name,
                    lastName : profile.last_name,
                    displayName: profile.name,
                    email: profile.email,
                    username: profile.email,
                    picture: `https://graph.facebook.com/${profile.id}/picture` //?height=500 --> https://developers.facebook.com/docs/graph-api/reference/user/picture/?locale=es_ES
                }
                break;
            case 'twitter':
                const splitName = profile.name.split(' ');
                standardProfile = {
                    id: profile.id,
                    firstName : splitName[0],
                    lastName : splitName.length > 1 ? splitName[1] : '',
                    displayName: profile.name,
                    email: undefined,
                    username: profile.username,
                    picture: profile.profile_image_url,
                    provider: profile.provider
                }
                break;
            default:
                standardProfile = profile as StandarizedUserProfile;
                break;
        }
        return standardProfile;
    }