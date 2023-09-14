import { GenericObject } from "@core";
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
    email_confirmed_at?:number;
    phone?:string;
    phone_confirmed_at?:number;
    last_sign_in_at?:number;
    active:boolean;
    active_changed_at?:number;
    created_at?:number;
    updated_at?:number;
    update:()=>void;
    remove:()=>void;
    setAttributes: (requestParams:GenericObject) => number;
    setPassword: (value : string) => void;
    passwordMatch: (password:string) => boolean;
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
    getById(id:number): Promise<IUser | undefined>
    getAll(): Promise<IUser[]>
    remove(username:string): Promise<void>
    usernameByCertificate(certificate:string):Promise<string>
    usernameByCredential(credential:string): Promise<string>
}

export abstract class IUserInstanceAdapter {
    constructor(protected instance:IUser){
    }
    abstract create():number;
    abstract update():void;
    abstract remove():void;
    abstract addCredential(credential:string):void;
    abstract addCertificate (certificate:string):void;
    abstract addAuthenticator (authenticator:string):void;
    abstract setProviderId (provider:string, id:string):void;
}