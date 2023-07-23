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
export const HASH_SALT = 'hashSalt';
const HASH_ALGORITHM = `sha512`;
const HASH_LENGTH = 64;
const HASH_ITERATIONS = 1000;

export const hashPassword = (password: string, passwordSalt: string): string => {
    const passwordHash: string = crypto.pbkdf2Sync(password, passwordSalt, HASH_ITERATIONS, HASH_LENGTH, HASH_ALGORITHM).toString(`hex`);
    return passwordHash;
}