import { IModel } from "model";

export interface IUser extends IModel {
    id:number;
    username:string;
    firstName:string;
    lastName:string;
    password?:string;
    picture?:string
    googleId?:string;
    liveId?:string;
    twitterId?:string;
    credentials:string[];
    authenticators:string[];
    certificates:string[];
    displayName:string;
    initials:string;
    findCredential: (credentialId:string) => string | undefined;
    findCertificate: (certificateId:string) => string | undefined;
    findAuthenticator: (authenticatorId:string) => string | undefined;
    addCredential: (credential:string) => IUser;
    addCertificate: (certificate:string) => IUser;
    addAuthenticator: (authenticator:string) => IUser;
    setProviderId: (provider:string, id:string) => IUser;
    getProviderId: (provider:string) => string | undefined;
}

export interface IUserAdapter {
    getAdapter(user:IUser): IUserInstanceAdapter
    get(username:string): Promise<IUser | undefined>
    usernameByCertificate(certificate:string):Promise<string>
    usernameByCredential(credential:string): Promise<string>
}

export abstract class IUserInstanceAdapter {
    constructor(protected user:IUser){
    }
    abstract newUser():void;
    abstract addCredential(credential:string):void;
    abstract addCertificate (certificate:string):void;
    abstract addAuthenticator (authenticator:string):void;
    abstract setProviderId (provider:string, id:string):void;
}