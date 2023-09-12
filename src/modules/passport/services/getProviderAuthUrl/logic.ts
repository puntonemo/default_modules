import { encrypt } from "modules/passport/tools";

type State = {
    data?:string,
    redirect_uri?:string,
    deviceId?:string,
    sessionId?:string
}
type GoogleDataQueryString = {
    client_id?:string,
    redirect_uri?:string,
    scope?:string,
    response_type?:string,
    access_type?:string,
    prompt?:string,
    state?:string
}
type TwitterDataQueryString = {
    response_type?:string,
    client_id?:string,
    redirect_uri?:string,
    state?:string,
    code_challenge?:string,
    code_challenge_method?:string,
    scope?:string,
}
type LiveDataQueryString = {
    client_id?:string,
    redirect_uri?:string,
    scope?:string,
    response_type?:string,
    access_type?:string,
    prompt?:string
    state?:string
}
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
export const getProviderAuthUrl = (provider:string, redirect_uri:string, stateString?:string, scopes?:string, sessionId?:string, deviceId?:string) => {
    var state:State;

    if(!redirect_uri) redirect_uri = process.env.REDIRECT_URI_BASE || "";

    if(!stateString)
        stateString = "{}";
    try{
        stateString = decodeURIComponent(stateString);
        state = JSON.parse(stateString);
    }catch{
        state ={
            data:decodeURIComponent(stateString)
        }
    }
    state.redirect_uri = redirect_uri;
    if(sessionId) state.sessionId = sessionId;
    if(deviceId) state.deviceId = deviceId;

    switch(provider.toLowerCase()){
        case 'google':
            if(!redirect_uri) return null;
            if(!scopes) scopes = process.env.GOOGLE_DEFAULT_SCOPES || "";
            //https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints_2
            var googleData:GoogleDataQueryString = {
                client_id: process.env.GOOGLE_CLIENT_ID,
                redirect_uri: `${process.env.REDIRECT_URI_BASE}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
                scope: scopes,
                response_type: process.env.GOOGLE_RESPONSE_TYPE,
                access_type: process.env.GOOGLE_ACCESS_TYPE,
                prompt: process.env.GOOGLE_PROMPT,
                state: encrypt(JSON.stringify(state))
            }
            const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(googleData).toString()}`;
            return googleLoginUrl;
            break;
        case 'twitter':
                if(!redirect_uri) return null;
                if(!scopes) scopes = process.env.TWITTER_DEFAULT_SCOPES || "";
                //https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#oauth-2.0-endpoints_2
                var twitterData:TwitterDataQueryString = {
                    response_type: process.env.TWITTER_RESPONSE_TYPE,
                    client_id: process.env.TWITTER_CLIENT_ID,
                    redirect_uri: `${process.env.REDIRECT_URI_BASE}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
                    state: encrypt(JSON.stringify(state)),
                    code_challenge: process.env.TWITTER_CODE_CHALLENGE,
                    code_challenge_method: process.env.TWITTER_CODE_CHALLENGE_METHOD,
                    scope: scopes
                }

                const twitterLoginUrl = `https://twitter.com/i/oauth2/authorize?${new URLSearchParams(twitterData).toString()}`;
                return twitterLoginUrl;
                break;
        
        case 'live':
            if(!redirect_uri) return null;
            if(!scopes) scopes = process.env.LIVE_DEFAULT_SCOPES || "";
            var liveData:LiveDataQueryString = {
                client_id: process.env.LIVE_CLIENT_ID,
                redirect_uri: `${process.env.REDIRECT_URI_BASE}${process.env.REDIRECT_URI_PATH}/${provider.toLowerCase()}`,
                scope:  scopes,
                response_type: process.env.LIVE_RESPONSE_TYPE,
                access_type: process.env.LIVE_ACCESS_TYPE,
                prompt: process.env.LIVE_PROMPT,
                state: encrypt(JSON.stringify(state))
            }
            const liveLoginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams(liveData).toString()}`;
            return liveLoginUrl;
            break;
            /*
            https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?
            client_id=6731de76-14a6-49ae-97bc-6eba6914391e
            &response_type=code
            &redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F
            &response_mode=query
            &scope=openid%20offline_access%20https%3A%2F%2Fads.microsoft.com%2Fmsads.manage
            &state=12345
            */
            break;

        
        default:
            return null;
    }
}