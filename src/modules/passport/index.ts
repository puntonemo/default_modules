import { nemo } from '../..';

import getProviderAuthUrl from './services/getProviderAuthUrl';
import digestProviderResponse from './services/digestProviderResponse';
import decodeState from './services/decodeState';

/*****************************************************/
/* ShortHands                                        */
type Service = nemo.Service;
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
const responseError = nemo.responseError;
const events = nemo.events;
const Session = nemo.Session;
export { nemo };
/*                                                   */
/*****************************************************/

export const _deviceId = 'deviceId'

export const init = () => {
    console.log('PASSPORT Module v.1.9');
}



export const Services:Service[] = [
    {
        name: "getProviderAuthUrl",
        get : "/api/passport/authUrl/:provider",
        manager:getProviderAuthUrl,
        serviceState : "stateless",
        serviceType:'json'
    },
    {
        name: "digestProviderResponse",
        get : "/api/passport/response/:provider",
        manager:digestProviderResponse,
        serviceState : "stateless",
        serviceType:'json'
    },
    {
        name: "decodeState",
        public:false,
        manager:decodeState,
        serviceState : "stateless",
        serviceType:'json'
    },
]