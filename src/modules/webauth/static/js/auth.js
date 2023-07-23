// @ts-nocheck
/* https://github.com/passwordless-id/webauthn/tree/main/src */
const webauthAvailable = () => {
    return !!window.PublicKeyCredential;
}
const isLocalAuthenticator = async () => {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}
const toBuffer = (txt) => {
    return Uint8Array.from(txt, c => c.charCodeAt(0)).buffer
}
const parseBase64url = (txt) => {
    txt = txt.replaceAll('-', '+').replaceAll('_', '/') // base64url -> base64
    return toBuffer(atob(txt))
}
const sha256 = async (buffer) => {
    return await crypto.subtle.digest('SHA-256', buffer)
}
const getAuthAttachment = async (authType) => {
    if(authType === "local")
        return "platform";
    if(authType === "roaming" || authType === "extern")
        return "cross-platform";
    if(authType === "both")
        return undefined // The webauthn protocol considers `null` as invalid but `undefined` as "both"!

    // the default case: "auto", depending on device capabilities
    try {
        if(await isLocalAuthenticator())
            return "platform"
        else
            return "cross-platform"
    } catch(e) {
        // might happen due to some security policies
        // see https://w3c.github.io/webauthn/#sctn-isUserVerifyingPlatformAuthenticatorAvailable
        return undefined // The webauthn protocol considers `null` as invalid but `undefined` as "both"!
    }
}
const parseBuffer = (buffer) => {
    return String.fromCharCode(...new Uint8Array(buffer))
}
const toBase64url = (buffer) => {
    const txt = btoa(parseBuffer(buffer)) // base64
    return txt.replaceAll('+', '-').replaceAll('/', '_')
}
const isBase64url = (txt) => {
    return txt.match(/^[a-zA-Z0-9\-_]+=*$/) !== null
}
const getAlgoName = (num) => {
    switch(num) {
        case -7: return "ES256"
        // case -8 ignored to to its rarity
        case -257: return "RS256"
        default: throw new Error(`Unknown algorithm code: ${num}`)
    }
}
const getTransports = async (authType) => {
    const local = ['internal']

    // 'hybrid' was added mid-2022 in the specs and currently not yet available in the official dom types
    // @ts-ignore
    const roaming = ['hybrid', 'usb', 'ble', 'nfc']
    
    if(authType === "local")
        return local
    if(authType == "roaming" || authType === "extern")
        return roaming
    if(authType === "both")
        return [...local, ...roaming]

    // the default case: "auto", depending on device capabilities
    try {
        if(await isLocalAuthenticator())
            return local
        else
            return roaming
    } catch(e) {
        return [...local, ...roaming]
    }
}
/**
 * Creates a cryptographic key pair, in order to register the public key for later passwordless authentication.
 *
 * @param {string} username
 * @param {string} challenge A server-side randomly generated string.
 * @param {Object} [options] Optional parameters.
 * @param {number} [options.timeout=60000] Number of milliseconds the user has to respond to the biometric/PIN check.
 * @param {'required'|'preferred'|'discouraged'} [options.userVerification='required'] Whether to prompt for biometric/PIN check or not.
 * @param {'auto'|'local'|'roaming'|'both'}       [options.authenticatorType='auto'] Which device to use as authenticator.
 *          'auto': if the local device can be used as authenticator it will be preferred. Otherwise it will prompt for a roaming device.
 *          'local': use the local device (using TouchID, FaceID, Windows Hello or PIN)
 *          'roaming': use a roaming device (security key or connected phone)
 *          'both': prompt the user to choose between local or roaming device. The UI and user interaction in this case is platform specific.
 * @param {boolean} [attestation=false] If enabled, the device attestation and clientData will be provided as Base64url encoded binary data.
 *                                Note that this is not available on some platforms.
 */
const register = async (username, challenge, options) => {

    if(!webauthAvailable())
        throw new Error('webauth is not available');
    
    if(!isBase64url(challenge))
        throw new Error('Provided challenge is not properly encoded in Base64url');
    
    
    const creationOptions  = {
        challenge: parseBase64url(challenge),
        rp: {
            id: window.location.hostname,
            name: window.location.hostname
        },
        user: {
            id: await sha256(new TextEncoder().encode(username)), // ID should not be directly "identifiable" for privacy concerns
            name: username,
            displayName: username,
        },
        pubKeyCredParams: [
            {alg: -7, type: "public-key"},   // ES256 (Webauthn's default algorithm)
            {alg: -257, type: "public-key"}, // RS256 (for Windows Hello and others)
        ],
        timeout: options.timeout ?? 60000,
        authenticatorSelection: {
            userVerification: options.userVerification ?? "required", // Webauthn default is "preferred"
            authenticatorAttachment: await getAuthAttachment(options.authenticatorType ?? "auto"),
        },
        attestation: options.attestation ? "direct" : "none"
    }
    if(options.excludeCredentials && Array.isArray(options.excludeCredentials) && options.excludeCredentials.length>0){
        const transports = await getTransports(options.authenticatorType ?? "auto");
        creationOptions.excludeCredentials = options.excludeCredentials.map(id => { return {
            id: parseBase64url(id),
            type: 'public-key',
            transports: transports,
        }})
    }
    if(options.debug)
        console.debug(creationOptions);

    const credential = await navigator.credentials.create({publicKey: creationOptions});
    const response = credential.response;
    let registration  = {
        username: username,
        credential: {
            id: credential.id,
            publicKey: toBase64url(response.getPublicKey()),
            algorithm: getAlgoName(credential.response.getPublicKeyAlgorithm())
        },
        authenticatorData: toBase64url(response.getAuthenticatorData()),
        clientData: toBase64url(response.clientDataJSON),
    }
    if(options.attestation) {
        registration.attestationData = toBase64url(response.attestationObject)
    }

    return registration;
}
/**
 * Signs a challenge using one of the provided credentials IDs in order to authenticate the user.
 *
 * @param {string[]} credentialIds The list of credential IDs that can be used for signing.
 * @param {string} challenge A server-side randomly generated string, the base64 encoded version will be signed.
 * @param {Object} [options] Optional parameters.
 * @param {number} [options.timeout=60000] Number of milliseconds the user has to respond to the biometric/PIN check.
 * @param {'required'|'preferred'|'discouraged'} [options.userVerification='required'] Whether to prompt for biometric/PIN check or not.
 */
const authenticate = async (credentialIds, challenge, options) => {
    options = options ?? {}

    if(!webauthAvailable())
        throw new Error('webauth is not available');

    if(!isBase64url(challenge))
        throw new Error('Provided challenge is not properly encoded in Base64url')

    const transports = await getTransports(options.authenticatorType ?? "auto");
    var allowCredentials = [];

    if(credentialIds){
        allowCredentials = credentialIds.map(id => { return {
            id: parseBase64url(id),
            type: 'public-key',
            transports: transports,
        }})
    }
    let authOptions = {
        challenge: parseBase64url(challenge),
        rpId: window.location.hostname,
        allowCredentials: allowCredentials,
        userVerification: options.userVerification ?? "required",
        timeout: options.timeout ?? 60000,
        attestation: options.attestation ? "direct" : "none"
    }
    if(options.debug)
        console.debug(authOptions)

    let auth = await navigator.credentials.get({publicKey: authOptions, mediation: options.mediation})
    
    if(options.debug)
        console.debug(auth);

    const response = auth.response;
    
    const authentication = {
        credentialId: auth.id,
        //userHash: toBase64url(response.userHandle), // unreliable, optional for authenticators
        authenticatorData: toBase64url(response.authenticatorData),
        clientData: toBase64url(response.clientDataJSON),
        signature: toBase64url(response.signature),
    }
    if(options.debug)
        console.debug(authentication);

    return authentication
}
/** shorthands **/
const registerUser = async (username, challenge, excludeCredentials) => {
    const registerUserOptions = {
        "authenticatorType": "both",
        "userVerification": "required",
        "timeout": 60000,
        "excludeCredentials": excludeCredentials
    }
    return register(username, challenge, registerUserOptions)
}
const registerKey = async (username, challenge, excludeCredentials) => {
    const registerKeyOptions = {
        "authenticatorType": "extern",
        "userVerification": "required",
        "timeout": 60000,
        "excludeCredentials": excludeCredentials
    }
    return register(username, challenge, registerKeyOptions);
}
const authenticateUser = async (credentials, challenge) => {
    const authenticateUserOptions = {
        "authenticatorType": "both",
        "userVerification": "required",
        "timeout": 60000
    }
    return authenticate(credentials, challenge, authenticateUserOptions);
}
const authenticateKey = async (credentials, challenge) => {
    const authenticateKeyOptions = {
        "authenticatorType": "extern",
        "userVerification": "required",
        "timeout": 60000
    }
    return authenticate(credentials, challenge, authenticateKeyOptions);
}