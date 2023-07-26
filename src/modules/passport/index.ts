import  {core, Service, ClientRequest, GenericObject, responseError, fetch, Session} from '../..';
export  {core, Service, ClientRequest, GenericObject, responseError, fetch, Session}

import getProviderAuthUrl from './services/getProviderAuthUrl';
import digestProviderResponse from './services/digestProviderResponse';
import decodeState from './services/decodeState';

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