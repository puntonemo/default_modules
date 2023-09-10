import { ClientRequest, GenericObject, responseError, config, gatewayConfig, ServerConnection, ServerVersion, ServerBuildNumber } from 'core';

const getConfig = (request:ClientRequest):Promise<GenericObject> => new Promise(async (resolve, reject)=>{
    //... your code goes here
    if(request){
        const sconfig = {...config};
        const gateway = {...gatewayConfig};
        const remoteServers = [];
        const gatewayServers = [];
        for(const gatewayServer of ServerConnection.gatewayServer){
            const gatewayServerData:GenericObject = {}
            gatewayServerData[gatewayServer.id] = gatewayServer.handshake;
            
            gatewayServers.push(gatewayServerData)
        }
        for(const remoteServer of ServerConnection.remoteServers){
            const responseRemoteServer = {
                hostName : remoteServer[0],
                name:remoteServer[1].name,
                live:remoteServer[1].live,
                replica:remoteServer[1].replica,
                connected:remoteServer[1].serverConnection?.connected || false,
                handshaked:remoteServer[1].serverConnection?.handshaked || false,
                lag:remoteServer[1].serverConnection?.lag || -1
            }
            remoteServers.push(responseRemoteServer);
        }
        
        // REMOVE CRITICAL PRIVATE INFO
        delete sconfig.GATEWAY_AUTO_ATTACH_PASSKEY;
        delete sconfig.HTTPS_PASSPHRASE;
        delete gateway?.AUTO_ATTACH_PASSKEY;
        if(gateway && gateway.PASSKEY) gateway.PASSKEY = undefined;
        //
        const response = {
            version : ServerVersion,
            build : ServerBuildNumber,
            config,
            gateway,
            remoteServers,
            gatewayServers
        }
        resolve(response);
    }else{
        reject(responseError(404));
    }
});

export default getConfig;