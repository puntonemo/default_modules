import * as crypto from 'crypto';
import base64url from 'base64url';

/**
 * Returns base64url encoded buffer of the given length
 * @param  {Number} len - length of the buffer
 * @return {String}     - base64url random buffer
 */
export const randomBase64URLBuffer = (len:number) => {
    len = len || 32;

    let buff = crypto.randomBytes(len);

    return base64url(buff);
}