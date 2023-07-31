// @ts-nocheck
window.signUpMode = 'webauth';
const signUpInitPageEvents = async () => {
    //window.multiCollapseExample1 = new bootstrap.Collapse(document.getElementById('collapse1'));
    document.getElementById('signupEmail').addEventListener('click', ()=>{
        new bootstrap.Collapse(document.getElementById('collapse1'));
        new bootstrap.Collapse(document.getElementById('collapse2'));
        new bootstrap.Collapse(document.getElementById('collapse3'));
        new bootstrap.Collapse(document.getElementById('collapse4'));
        document.getElementById('username').focus();
    })
    
    document.getElementById('btnSignUp').addEventListener('click', async (e)=>{
        e.preventDefault();
        
        const form = document.getElementById('signUpForm');
        if(!form.checkValidity()){
            e.preventDefault();
            e.stopPropagation();
            console.log('FORM NOT VALID');
        }
        form.classList.add('was-validated');
        let valid = false;
        let username = document.getElementById('username').value.trim();
        let firstname = document.getElementById('firstname').value.trim();
        let lastname = document.getElementById('lastname').value.trim();
        let password = document.getElementById('password').value.trim();
        let password2 = document.getElementById('password2').value.trim();
        
        if(password && password2==password){
            document.getElementById('password2').classList.add('is-invalid');
            if(username && firstname && lastname && password) valid = true;
        }else{
            document.getElementById('password2').classList.add('is-invalid');
            form.classList.remove('was-validated');
        }
        console.log(window.signUpMode, valid);
        if(!valid) return;
        console.log(username , firstname , lastname , password);
        /** REGISTER USER WITH PASSWORD (and Device) */
        if(window.signUpMode == 'webauth'){
            console.log('signup mode: webauth');
            app.api.webauth.registerUser({username, firstName:firstname, lastName: lastname, password}).then(()=>{
                if(document.getElementById('registerDevice').checked){
                    registerDevice(username, firstname, lastname).then(()=>{
                        window.location = "/";
                    }).catch(errorCode=>{
                        alert(`Device not registered. errorCode=${errorCode}`)
                    })
                }else{
                    window.location = "/";
                }
            }).catch(error=>{
                if(error.status == 400){
                    new bootstrap.Collapse(document.getElementById('collapseUserAlreadyExisting'));
                }else{
                    alert('Error registering user');
                    console.log(error);
                }
            })
        }
        /** REGISTER USER WITH PASSWORD (and Device) */
        if(window.signUpMode == 'cert'){
            console.log('signup mode: cert');
            app.api.webauth.registerCert({username, firstName:firstname, lastName: lastname}).then(result=>{
                window.location = '/';
            })
        }
    });
    document.getElementById('btnSignUpCertificate').addEventListener('click', ()=>{
        registerClientCertificate();
    });
    document.getElementById('btnSignUpCertificate2').addEventListener('click', ()=>{
        registerClientCertificate();
    });
    if(webauthAvailable() && await isLocalAuthenticator()){
        document.getElementById('registerDevice').checked = true;
        document.getElementById('registerDeviceContainer').classList.remove('d-none');
    }
}
const registerClientCertificate = () => {
    app.api.webauth.getCertificateInfo().then(certificateInfo=>{
        const {
            displayName,
            email,
            firstName,
            idces,
            lastName,
        } = certificateInfo;
        document.getElementById('username').value = email;
        document.getElementById('firstname').value = firstName;
        document.getElementById('lastname').value = lastName;
        document.getElementById('password').value = `${Date.now()}`;
        document.getElementById('password2').value = `${Date.now()}`;
        new bootstrap.Collapse(document.getElementById('collapse1'));
        new bootstrap.Collapse(document.getElementById('collapse2'));
        new bootstrap.Collapse(document.getElementById('collapse3'));
        new bootstrap.Collapse(document.getElementById('collapsePassword'));
        window.signUpMode = 'cert';
    })
}
const registerDevice = async (username, firstname, lastname) => {
    app.api.webauth.getChallenge({username, firstname, lastname}).then(webauthFlowData=>{
        registerUser(username, webauthFlowData.challenge, webauthFlowData.credentials).then(registration =>{
            app.api.webauth.setCredential(registration).then(result=>{
                localStorage.webauthUsername = result.username;
                localStorage.webauthName = result.firstname;
                return 0;
            }).catch(error=>{
                console.log(error);
                return -1
            });
        }).catch(error=>{
            console.log(error);
            return -2
        });
    }).catch(error=>{
        console.log(error);
        return -3;
    })
}

document.addEventListener("DOMContentLoaded", () => { 
    signUpInitPageEvents();
});
