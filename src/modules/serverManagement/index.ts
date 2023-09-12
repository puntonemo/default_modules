import  { Service } from 'core';


import getConfig from './services/getConfig';

export const version = '1.9.1'
export const init = () => {

}

export const Services:Service[] = [
    {
        name: 'getConfig',
        serviceType:'json',
        serviceState:'stateless',
        public:false,
        excludeFromReplicas:true,
        get:'/api/serverManagement/config',
        manager : getConfig
    }
]