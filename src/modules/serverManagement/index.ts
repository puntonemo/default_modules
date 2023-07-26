import  {core, Service, ClientRequest, GenericObject, responseError, fetch, Session} from '../..';
export  {core, Service, ClientRequest, GenericObject, responseError, fetch, Session}

import getConfig from './services/getConfig';

export const init = () => {
    console.log('SERVER MANAGEMENT Module v.1.9');
}

export const Services:Service[] = [
    {
        name: 'getConfig',
        serviceType:'json',
        serviceState:'stateless',
        public:false,
        excludeFromReplicas:false,
        get:'/api/serverManagement/config',
        manager : getConfig
    }
]