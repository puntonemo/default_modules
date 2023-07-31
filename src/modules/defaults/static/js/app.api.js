// @ts-nocheck
/******
 * app.api.js
 * v.1.4
 */
var app = (function(public) {
    public["api"] = {};
    const maxRequestTimeout = 5000;
    const tokenName = "token";
    const deviceName = "did";
    const deviceLength = 20;
    const sessionName = "sid";
    const sessionLength = 20;
    const logicRoot = public["api"];
    var tokenStorage = "localStorage";
    var socketConnected;
    var socket;
    var promises = {};
    
    
    /**
     * Connect to Host
     * 
     * @param {string}   host   Host to connect.
     * @param {string}   token  Auth token
     * @param {function} ready  connect callback.
     * @param {function} down   disconnect callback.
     */
    connect = (host, token, ready, down) => {
        var options;

        if(typeof(host)==='function'){
            ready = host;
            down = token;
            token = null;
            host = null;
                        
        }else{
            if(typeof(token)==='function'){
                down = ready;
                ready = token;
                token = host;
                host = null;                
            }
        }
       
        if(!token){
            token = getToken();
        }

        options = { 
            transports: ['websocket'],
            auth: { }
        };
        if(token) options.auth.token = token;
        //options = { transports: ['websocket'] }
        if(!host){
            host = window.location.origin
        }
        if(!getCookie(sessionName)){
            setCookie(sessionName, makeid(sessionLength));
        }
        if(!getCookie(deviceName)){
            setCookie(deviceName, deviceId);
        }
        socket = io.connect(host, options);
        socket.on('connect', () => {
            public.connected = socket.id;
            public.socket = socket;
            if(typeof(ready)==='function'){
                ready({
                    id:socket.id
                })
            }
        });
        socket.on('disconnect', () => {
            public.connected = false;
            //delCookie(sessionName, socket.id);
            if(typeof(down)==='function'){
                down({
                    id:socket.id
                })
            }
        });
        socket.on('response', (tid, response) => {
            if(response && response.hasOwnProperty('token')){
                if(response.token){
                    //Server is updating Auth Token
                    setToken(response.token);
                }else{
                    //Logout (Removing Token)
                    delToken();
                }
            }

            if(promises[tid]){
                clearTimeout(promises[tid].timeout);
                promises[tid].resolve(response);
                delete promises[tid];
            }
        });
        socket.on('error', (tid, response) => {
            if(response.hasOwnProperty('token')){
                if(response.token){
                    //Server is updating Auth Token
                    setToken(response.token);
                }else{
                    //Logout (Removing Token)
                    delToken();
                }
            }

            if(promises[tid]){
                promises[tid].reject(response);
                clearTimeout(promises[tid].timeout);
                //console.log('error, add an event here', response);
                delete promises[tid];
            }            
        });
        socket.on('redirect', (tid, url, status) => {
            if(promises[tid]){
                clearTimeout(promises[tid].timeout);
                promises[tid].resolve();
                delete promises[tid];
            }
            public.onRedirect(url, status);
        });
        socket.on('cookie', (cookieName, cookieValue, cookieMaxAge)=>{
            if(cookieValue){
                setCookie(cookieName, cookieValue, cookieMaxAge);
            }else{
                delCookie(cookieName);
            }
        })
        socket.on('will', (tid, response) => {
            if(promises[tid]){
                if(typeof(promises[tid].feedback)==='function'){
                    promises[tid].feedback(response);
                }
                clearTimeout(promises[tid].timeout);
                promises[tid].will=true;
            }            
        });
    }
    disconnect = () => {
        if(socket.connected){
            socket.disconnect();
            return;
        }else{
            return;
        }
    }
    /**
     * Manage custom events
     * @param {string}  event   event name to liston to
     * @param {function} callback callback
     */
    on = (event, callback) =>{
        socket.on(event, callback);
    }
    emit = (method, data, feedback) => 
        new Promise((resolve,reject) => {
            const tid = makeid();
            let message = {
                tid : tid
            }

            /*
            if(typeof(data)==='Object' || typeof(data)==='object'){
                Object.keys(data).forEach(key => { 
                    message[key] = data[key];
                });
            }          
            */
            socket.emit('request', method, data, tid);
            promises[tid] = {
                resolve : resolve,
                reject : reject,
                feedback: feedback,
                timeout : setTimeout(()=>{timeoutRequest(tid)}, maxRequestTimeout),
                will:false
            }
            
        });

    timeoutRequest = (tid) => {
        const response504 = {   
            result  : "error",
            code    : 504,
            message : "Gateway Timeout"
        }
        if(promises[tid]){
            promises[tid].reject(response504);
        }
        //promises[tid].reject(data);
    }
    setCookie = (cName, cValue, expDays) => {
        let date = new Date();
        let expires = '';
        if(expDays){
            date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
            expires = "expires=" + date.toUTCString() + "; ";
        }
        
        document.cookie = cName + "=" + cValue + "; " + expires + "path=/; SameSite=Strict; Secure";
    }
    getCookie = (cName) => {
        const name = cName + "=";
        const cDecoded = decodeURIComponent(document.cookie); //to be careful
        const cArr = cDecoded .split('; ');
        let res;
        cArr.forEach(val => {
            if (val.indexOf(name) === 0) res = val.substring(name.length);
        })
        if (res=="") res = undefined;
        return res;
    }
    delCookie = (cName) => {
        document.cookie = `${cName}=;path=/;max-age=0";`;
    }
    setToken = (token) => {
        console.log('setToken %o on %o', token, tokenStorage);

        switch(tokenStorage){
            case 'cookie':
                setCookie(tokenName, token);
                break;
            case 'sessionStorage':
                sessionStorage[tokenName] = token;
                break;
            case 'localStorage':
            default:
                localStorage[tokenName] = token;
        }
    }
    getToken = () => {
        switch(tokenStorage){
            case 'cookie':
                return getCookie(tokenName);
                
            case 'sessionStorage':
                return sessionStorage[tokenName];
                
            case 'localStorage':
            default:
                return localStorage[tokenName];
        }
        
    }
    delToken = () => {
        console.log('delToken');
        switch(tokenStorage){
            case 'cookie':
                delCookie(tokenName);
                break;
            case 'sessionStorage':
                delete sessionStorage[tokenName];
                break;
            case 'localStorage':
            default:
                delete localStorage[tokenName];
        }
    }
    setDeviceId = () => {
        deviceId = makeid(deviceLength);
        //console.log('setDeviceId', deviceId, tokenStorage);
        switch(tokenStorage){
            case 'cookie':
                setCookie(deviceName, deviceId, 1000);
                break;
            case 'sessionStorage':
            case 'localStorage':
            default:
                localStorage[deviceName] = deviceId;
        }
        return deviceId;
    }
    getDeviceId = () => {
        //console.log('getDeviceId from ', tokenStorage);
        switch(tokenStorage){
            case 'cookie':
                deviceId = getCookie(deviceName);
                return deviceId;
                case 'sessionStorage':
            case 'localStorage':
            default:
                deviceId = localStorage[deviceName];
                return deviceId;
        }
    }
    /*
     *    Make an http request
     */
    request = async (method='GET', url = '', data, postMode = 'form') =>
        new Promise((resolve,reject) => {
            // https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Utilizando_Fetch
            // Opciones por defecto estan marcadas con un *
            var referrerPolicy = 'no-referrer'; // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            var redirect = 'follow'; // manual, *follow, error'
            var credentials = 'same-origin'; // include, *same-origin, omit
            var cache = 'no-cache'; // *default, no-cache, reload, force-cache, only-if-cached
            var mode = 'cors'; // no-cors, *cors, same-origin
            //var headers = {
            //    'Content-Type': 'application/json',
            //    // 'Authorization': 'token'
            //    // 'Content-Type': 'application/x-www-form-urlencoded',
            //};
            var headers = {};
            const options ={
                method, // *GET, POST, PUT, DELETE, etc.
                mode,
                cache,
                credentials,
                headers,
                redirect,
                referrerPolicy,
            }
            //console.log('==== MATHING URL PARAMETERS ================================');
            const paramRegex = /:[A-z0-9\-\%\:]+/g;
            var match;
            while(match = paramRegex.exec(url)) {
                const param = match[0].substring(1);
                url = url.replace(match[0], data[param]);
                delete data[param];
            }
            if(['GET', 'HEAD'].includes(method.toUpperCase())){
                // CONVERT DE DATA TO URL PARAMS
                var query = '';
                if(data){
                    Object.keys(data).forEach(key => {
                        query = query!='' ? query +='&' : query;
                        query += `${encodeURIComponent(key)}=${encodeURIComponent(data[key]).toString()}`;
                    });
                    if(query) url = url+='?'+query;
                }
            }else{
                if(data) {
                    if(postMode == 'form'){
                        var formData = new FormData();
                        for(const key of Object.keys(data)){
                            formData.append(key, data[key]);
                        }
                        options.body = formData;
                    }else{
                        options.headers["content-type"] = "application/json";
                        options.body = JSON.stringify(data);
                    }
                }
            }
            fetch(url, options).then(res => res.json()).then(res => {
                if(res.result === 'error'){
                    //console.log('error, add an event here', res);
                    reject(res);
                }
                if(res.hasOwnProperty('token')){
                    if(res.token){
                        setToken(res.token);
                    }else{
                        delToken();
                    }
                    delete res.token;
                }
                resolve(res)
            }).catch(error=>{
                reject(error)
            });
        });
    /*
     *    Generate a random string
     */
    makeid = (length=10) => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }
    /*
     * ===============================================
     *   D I N A M I C   A P I   D I C T I O N A R Y
     * ===============================================
     */
    var methods;
    const invoke = (methodName, data, feedback) => new Promise ((resolve, reject)=>{
        const method = methods[methodName];
        if(method){
            if(public.connected && method.serviceType!='proxy'){
                emit(methodName, data, feedback).then(response=>resolve(response)).catch(error=>reject(error));
            }else{
                let httpMethod = undefined;
                let httpUrl = undefined;
                if(method.method && method.path){
                    httpMethod = method.method;
                    httpUrl = method.path;
                }else{
                    if(method.hasOwnProperty('get')) httpMethod = 'get';
                    if(method.hasOwnProperty('post')) httpMethod = 'post';
                    if(method.hasOwnProperty('put')) httpMethod = 'put';
                    if(method.hasOwnProperty('delete')) httpMethod = 'delete';
                    if(method.hasOwnProperty('all')) httpMethod = 'all';
                    if(method.hasOwnProperty('use')) httpMethod = 'use';
                    httpUrl = method[httpMethod];
                    if(['all', 'use'].includes(httpMethod)) httpMethod = 'get';
                    
                }
                if(httpMethod && httpUrl){
                    request(httpMethod, httpUrl, data, method.serviceType).then(res => resolve(res)).catch(error=>reject(error));
                }else{
                    reject('NOT CONNECTED. no http info for handler (%o)', methodName);        
                }
            }
        }else{
            reject('nohandler (%o)', methodName);
        }
    });
    // DIGEST API DICTIONARY
    (() => {
        let sources;
        let scriptElement;
        document.querySelectorAll('script[sources').forEach(item=>{
            if(item.src && item.src.endsWith('app.api.js')){
                scriptElement = item;
                if(item.attributes['sources'] && item.attributes['sources'].value)
                sources = item.attributes['sources'].value;
            }
        })
        if(!scriptElement){
            document.querySelectorAll('script[tokenStorage').forEach(item=>{
                if(item.src && item.src.endsWith('app.api.js')){
                    scriptElement = item;
                }
            })
        }
        if(scriptElement && scriptElement.attributes['tokenStorage'] && scriptElement.attributes['tokenStorage'].value){
            tokenStorage = scriptElement.attributes['tokenStorage'].value;
        }
        if(!getDeviceId()) setDeviceId();
        let dictUrl = '/api';
        if(sources) dictUrl += `?sources=${sources}`;
        request('GET', dictUrl).then(response=>{
            console.log('API dict', response);
            methods = response.dict;
            Object.keys(methods).forEach(name => {
                const ensurePath = (items, root) => {
                    var name = items.shift();
                    if(!root) root = logicRoot
                    if(!root[name]){
                        root[name] = {};
                    }
                    if(items.length>0){
                        return ensurePath(items, root[name]);
                    }
                    return root[name];
                }
                var methodName = name;
                var fullName = name.split('.');
                var lastPath, name;
                if(fullName.length>1){
                    name = fullName.pop();
                    lastPath = ensurePath(fullName);
                }else{
                    name = fullName[0];
                    lastPath = logicRoot;
                }
                lastPath[name] = (...args) => 
                    new Promise ((resolve, reject) =>
                        {
                            
                            var data = args[0];
                            var feedback = args[1];

                            if(!['object', 'undefined'].includes(typeof(data))){
                                data = {};
                                var parameters;
                                var arguments = [...args];                               

                                if(typeof(arguments[arguments.length-1]) == 'function'){
                                    feedback = arguments.splice(-1)[0];
                                }
                                if(methods[methodName].parameters){
                                    parameters = methods[methodName].parameters.split(',').map(item=>item = item.trim());
                                }else{
                                    reject(`no parameters definition for ${methodName}, please invoke with object`);
                                    return;
                                }
                                if(parameters.length != arguments.length){
                                    reject(`parameters count not match with definition. Expected ${parameters.length} : ${methods[methodName].parameters}`);
                                    return;
                                }
                                for(var i=0;i<parameters.length;i++) data[parameters[i]] = arguments[i];
                            }
                            invoke(methodName, data, feedback).then(response=>
                                resolve(response))
                                .catch(error=>
                                    reject(error))
                        });
            });
            public.api.dictionary = methods;
        }).catch(error=>console.log(error));
    })();
    /*
     * ====================================================
     *   E N D   O F   P R I V A T E    F U N C T I O N S
     * ====================================================
     */
    window.addEventListener('beforeunload', function (e) {
        //delCookie(sessionName);
    });

    var deviceId = getDeviceId();
    //public.connected = socketConnected;
    public.connect = connect;
    public.disconnect = disconnect;
    public.on = on;

    public.getCookie = getCookie;
    public.setCookie = setCookie;
    public.delCookie = delCookie;
    public.getToken = getToken;
    public.setToken = setToken;
    public.delToken = delToken;
    public.onRedirect = (url, status) => {
        //window.location = url;
        console.log('OnRedirect', url, status);
    }
    //public.api.dictionary = () => methods;
    
    return public;
}(app || {}));