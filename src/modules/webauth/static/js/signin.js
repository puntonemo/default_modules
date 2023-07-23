// @ts-nocheck
window.signInMode = 'webauth';
const signUpInitPageEvents = () => {
    //window.multiCollapseExample1 = new bootstrap.Collapse(document.getElementById('collapse1'));
    document.getElementById('signinEmail').addEventListener('click', async ()=>{
        new bootstrap.Collapse(document.getElementById('collapse1'));
        new bootstrap.Collapse(document.getElementById('collapse2'));
        new bootstrap.Collapse(document.getElementById('collapse3'));
        new bootstrap.Collapse(document.getElementById('collapse4'));
        //if (typeof window.PublicKeyCredential !== 'undefined' && typeof window.PublicKeyCredential.isConditionalMediationAvailable === 'function') {
        //    const available = await PublicKeyCredential.isConditionalMediationAvailable();
        //    alert(`available ${available}`);
        //    window.passKeyAvailable = available;
        //    if(available){
        //        const authenticateUserOptions = {
        //            "mediation":"conditional",
        //            "authenticatorType": "both",
        //            "userVerification": "required",
        //            "timeout": 60000
        //        }
        //        const webauthFlowData = await app.api.webauth.getChallenge();
        //        const authentication = await authenticate([], webauthFlowData.challenge, authenticateUserOptions);
        //        console.log(authentication);
        //        const user = await app.api.webauth.setCredential(authentication);
        //        console.log(user);
        //        localStorage.webauthUsername = user.username;
        //        localStorage.webauthName = user.firstName;
        //        alert(`Welcome ${user.firstName}`);
        //    }
        //}else{
        //    window.passKeyAvailable = false;
        //    alert(`available 2 ${window.passKeyAvailable}`);
        //}
        document.getElementById('username').focus();
    })
    document.getElementById('btnSignIn').addEventListener('click', async (event)=>{
        event.preventDefault();
        let username = document.getElementById('username').value;
        if(!username) {
            document.getElementById('username').classList.add('is-invalid')
            return
        }
        document.getElementById('username').classList.remove('is-invalid');
        if(window.signInMode == 'webauth'){
            if(window.passKeyAvailable == true){
                signInUser(username);
            }else{
                app.api.webauth.getChallenge({username}).then(webauthFlowData=>{
                    if(webauthFlowData.challenge){
                        const authenticateUserOptions = {
                            "authenticatorType": "both",
                            "userVerification": "required",
                            "timeout": 60000
                        }
                        authenticate(webauthFlowData.credentials, webauthFlowData.challenge, authenticateUserOptions).then(registration =>{
                            app.api.webauth.setCredential(registration).then(user=>{
                                localStorage.webauthUsername = username;
                                localStorage.webauthName = user.firstName;
                                window.location = '/';
                                return 0;
                            }).catch(error=>{
                                console.log(error);
                                new bootstrap.Collapse(document.getElementById('collapseUserNotFound'));
                                return -1
                            });
                        });
                    }else{
                        alert('INVALID USER');
                    }
                })
                
            }
        }else{
            let password = document.getElementById('password').value;
            if(!password) {
                document.getElementById('password').classList.add('is-invalid')
                return
            }
            document.getElementById('password').classList.remove('is-invalid');
            app.api.webauth.loginUser({username, password}).then(result=>{
                if(result.user){
                    localStorage.webauthUsername = result.username;
                    localStorage.webauthName = result.firstName;
                    if(document.getElementById('registerDevice').checked){
                        registerNewDevice(result.user.username, result.user.firstName, result.user.lastName).then(registration=>{
                            window.location = '/';
                        }).catch(error=>{
                            console.warn(error);
                            alert(`error ${error}`);
                        })
                    }else{
                        window.location = '/';
                    }
                }else{
                    alert('There is a problem with the server response');
                }

            }).catch(error=>{
                console.warn(error);
                new bootstrap.Collapse(document.getElementById('collapseUserNotFound'));
                
            })
        }
    });
    document.getElementById('btnChangeCredential').addEventListener('click', async (event)=>{
        delete localStorage.webauthUsername;
        delete localStorage.webauthName;
        new bootstrap.Collapse(document.getElementById('collapsePreviousCredentials'));
        new bootstrap.Collapse(document.getElementById('collapseDefault'));
    });
    document.getElementById('btnContinueSignedIn').addEventListener('click', async (event)=>{
        const username = localStorage.webauthUsername;
        if(username){
            signInUser(username);
        }else{
            alert('There was a problem with webauthUsername');
        }
    });
    document.getElementById('btnSignInWithPassword').addEventListener('click', async (event)=>{
        signInWithPassword();
    })
    document.getElementById('btnSignInCertificate').addEventListener('click', async ()=>{
        signInWithCertificate();
    });
    document.getElementById('btnSignInCertificate2').addEventListener('click', async ()=>{
        signInWithCertificate();
    });
}
const signInUser = async (username) => {
    try{
        const webauthFlowData = await app.api.webauth.getChallenge({username});
        if(webauthFlowData.challenge){
            const authentication = await authenticateUser(webauthFlowData.credentials, webauthFlowData.challenge);
            const user = await app.api.webauth.setCredential(authentication);
            if(user){
                window.location = '/';
                return;
            }else{
                alert('Error authenticating');
                new bootstrap.Collapse(document.getElementById('collapseUserNotFound'));
                return
            }
        }else{
            new bootstrap.Collapse(document.getElementById('collapseUserNotFound'));
            return
        }
    }catch(error){
        console.warn(error);
        signInWithPassword();
    }
}
const signInWithPassword = () => {
    if(signInMode == 'webauth'){
        if(webauthAvailable() ){ // && await isLocalAuthenticator()
            document.getElementById('registerDevice').checked = true;
            document.getElementById('registerDeviceContainer').classList.remove('d-none');
        }
        document.getElementById('btnSignInWithPassword').classList.add('d-none');
        new bootstrap.Collapse(document.getElementById('collapseSignInWithPassword'));
        window.signInMode = 'password';
    }
}
const signInWithCertificate = () => {
    app.api.webauth.loginCert().then(result=>{
        window.location = '/';
    }).catch(error=>{
        new bootstrap.Collapse(document.getElementById('collapseUserNotFound'));
        console.warn('signInWithCertificate error', error);
    })
}
const registerNewDevice = async (username, firstName, lastName) => {
    try{
        const webauthFlowData = await app.api.webauth.getChallenge({username, firstName, lastName});
        const registration = await registerUser(username, webauthFlowData.challenge, webauthFlowData.credentials);
        const result =  await app.api.webauth.setCredential(registration);
        localStorage.webauthUsername = username;
        localStorage.webauthName = firstName;
        return 0;
    }catch(error){
        console.warn(error);
        return -1;
    }
    //app.api.webauth.getChallenge({username, name}).then(webauthFlowData=>{
    //    registerUser(webauthFlowData.username, webauthFlowData.challenge, webauthFlowData.credentials).then(registration =>{
    //        app.api.webauth.setCredential(registration).then(result=>{
    //            localStorage.webauthUsername = username;
    //            localStorage.webauthName = name;
    //            console.log(result);
    //            return 0;
    //        }).catch(error=>{
    //            console.log(error);
    //            return -1
    //        });
    //    }).catch(error=>{
    //        console.log(error);
    //        return -2
    //    });
    //}).catch(error=>{
    //    console.log(error);
    //    return -3;
    //})
}
const checkPreviousCredentials = () => {
    if(localStorage.webauthUsername){        
        document.querySelectorAll(`[data-id="usernamePlaceholder"]`).forEach(element=>{
            element.innerHTML = localStorage.webauthName ?? localStorage.webauthUsername
        })
        new bootstrap.Collapse(document.getElementById('collapsePreviousCredentials'));
        new bootstrap.Collapse(document.getElementById('collapseDefault'));
    }
}
document.addEventListener("DOMContentLoaded", () => { 
    signUpInitPageEvents();
    checkPreviousCredentials();
});
