
import User from "../.."

export interface IUserAdapterStatic {
    get(username:string): Promise<User | undefined>,
    usernameByCertificate(certificate:string): Promise<string>,
    usernameByCredential(credential:string): Promise<string>
}
export abstract class IUserAdapter {
    constructor(protected user:User){
    }
    abstract newUser():void;
    abstract addCredential(credential:string):void;
    abstract addCertificate (certificate:string):void;
    abstract addAuthenticator (authenticator:string):void;
    abstract setProviderId (provider:string, id:string):void;
}
/*
Implement XXX adapter:

export const StaticXXXAdapter:IUserAdapter = {
    get(username:string): User | undefined {
        throw `not implemented for ${username}`;
    },
    usernameByCertificate(certificate:string):string {
        throw `not implemented for ${certificate}`;
    },
    usernameByCredential(credential:string):string {
        throw `not implemented for ${credential}`;
    }
}
export class XXXAdapter extends UserAdapter{
    override newUser(): void {
        throw `not implemented `;
    }
    override addCredential(credential: string): void {
        throw `not implemented for ${credential}`;
    }
    override addCertificate(certificate: string): void {
        throw `not implemented for ${certificate}`;
    }
    override addAuthenticator(authenticator: string): void {
        throw `not implemented for ${authenticator}`;
    }
    override setProviderId(provider: string, id: string): void {
        throw `not implemented for ${provider}/${id}`;
    }
}

*/