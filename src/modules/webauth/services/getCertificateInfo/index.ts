import { nemo } from "../..";
import { _deviceId, _login, _passportError, _profile } from "../..";

/*****************************************************/
/* ShortHands                                        */
type ClientRequest = nemo.ClientRequest;
type GenericObject = nemo.GenericObject;
/*                                                   */
/*****************************************************/

const getCertificateInfo = (request:ClientRequest):Promise<GenericObject> => new Promise((resolve, reject)=>{
    const firstName =request.certificate?.subject?.GN.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase());
    const lastName = request.certificate?.subject?.SN.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase());
    const email = request.certificate?.subjectaltname?.startsWith('email:') ? request.certificate?.subjectaltname?.substring(6).split(',')[0].toLowerCase() : undefined;
    const idces = request.certificate?.subject?.serialNumber.startsWith('IDCES-') ? request.certificate?.subject?.serialNumber.substring(6) : undefined;
    const certificateInfo = {
        //'displayName': `${firstName} ${lastName}`,
        'firstName': firstName,
        'lastName': lastName,
        'email' : email,
        //'idces': idces,
        //'certSerialNumber' : request.certificate?.serialNumber,
    };
    resolve(certificateInfo);
    if(false) reject();
});

export default getCertificateInfo;