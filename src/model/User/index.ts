import { IUser, IUserAdapter, IUserInstanceAdapter } from "./adapter";
export { IUser, IUserAdapter, IUserInstanceAdapter }
import { GenericObject } from "@core";
import * as crypto from 'crypto';

export default class User implements IUser {
    [k: string]: any;
    public id:number;
    public username:string;
    public firstName:string;
    public lastName:string;
    public password?:string;
    public picture?:string
    public googleId?:string;
    public liveId?:string;
    public twitterId?:string;
    private _credentials:string[];
    private _authenticators:string[];
    private _certificates:string[];
    public email_confirmed_at?:number;
    public phone?:string;
    public phone_confirmed_at?:number;
    public last_sign_in_at?:number;
    public active:boolean;
    public active_changed_at?:number;
    public created_at?:number;
    public updated_at?:number;
    // ADAPTERS
    private static Adapter:IUserAdapter;
    private Adapter:IUserInstanceAdapter;
    // CONSTRUCTOR
    constructor(
            id:number, 
            username:string, 
            firstName:string, 
            lastName:string, 
            password?:string, 
            picture?:string, 
            provider?:string, 
            providerId?:string, 
            authenticators?:string[], 
            credentials?:string[], 
            certificates?:string[],
            email_confirmed_at?:number,
            phone?:string,
            phone_confirmed_at?:number,
            last_sign_in_at?:number,
            active?:boolean,
            active_changed_at?:number
        ){
        // Adopt the instance adapter
        this.Adapter = User.Adapter.getAdapter(this);

        // Initialize member values
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.picture = picture;
        this._credentials = credentials ?? [];
        this._authenticators = authenticators ?? [];
        this._certificates = certificates ?? [];
        this.email_confirmed_at = email_confirmed_at;
        this.phone = phone;
        this.phone_confirmed_at = phone_confirmed_at;
        this.last_sign_in_at = last_sign_in_at;
        this.active = active || true;
        this.active_changed_at = active_changed_at;

        if(provider && providerId){
            this.setProviderId(provider, providerId);
        }
        if(id == 0) {
            this.id = this.Adapter.create();
        }
    }
    // Adopt the static adapter
    static setAdapter(userAdapter:IUserAdapter){
        User.Adapter = userAdapter;
    }

    // Static model implementation
    static get(username:string){
        return User.Adapter.get(username);
    }
    static getById(id:number){
        return User.Adapter.getById(id);
    }
    static getAll(){
        return User.Adapter.getAll();
    }
    static async usernameByCertificate(certificate:string):Promise<string> {
        const username = await this.Adapter.usernameByCertificate(certificate);
        return username
    }
    static async getByCertificate(certificate:string):Promise<IUser|undefined>{
        const username = await this.usernameByCertificate(certificate);
        if(username){
            return await this.get(username);
        }else{
            return undefined;
        }
    }
    static async usernameByCredential(credential:string):Promise<string> {
        const username = await this.Adapter.usernameByCredential(credential);
        return username
    }
    static remove(username:string){
        User.Adapter.remove(username);
    }
    // Instance model implementation
    private set authenticators (value:string[]) {
        this._authenticators = value;
    }
    private set credentials (value:string[]) {
        this._credentials = value;
    }
    private set certificates (value:string[]) {
        this._certificates = value;
    }
    
    get authenticators (){
        return this._authenticators;
    }
    get credentials (){
        return this._credentials;
    }
    get certificates (){
        return this._certificates;
    }
    get displayName(){
        return `${this.firstName} ${this.lastName}`;
    }
    get initials() {
        return `${this.firstName.substring(0,1).toUpperCase()}${this.lastName.substring(0,1).toUpperCase()}`;
    }
    setAttributes (attributes:GenericObject) {
        let updated = 0;
        const changeables = [
            `firstName`, 
            `lastName`, 
            `picture`, 
            `googleId`, 
            `liveId`, 
            `twitterId`, 
            `credentials`, 
            `authenticators`, 
            `certificates`, 
            `email_confirmed_at`, 
            `phone`, 
            `phone_confirmed_at`, 
            `last_sign_in_at`, 
            `active`, 
            `active_changed_at`, 
        ]
        const params = Object.getOwnPropertyNames(attributes);
    
        for(const attribute of changeables){
            if(params.includes(attribute)){
                this[attribute] = attributes[attribute];
                updated++;
            } 
        }

        if(params.includes('password')){
            this.setPassword(attributes['password']);
            updated++;
        }

        if(updated > 0) this.update();
        return updated;
    }
    setPassword(value : string) {
        this.password = hashPassword(value, this.username);
        this.update()
    }
    passwordMatch(password:string){
        return (hashPassword(password, this.username) === this.password)
    }
    findCredential (credentialId:string) {
        return this._credentials.find((val:string)=>val == credentialId);
    }
    findCertificate (certificateId:string) {
        return this._certificates.find((val:string)=>val == certificateId);
    }
    findAuthenticator (authenticatorId:string) {
        return this._authenticators.find((val:string)=>val == authenticatorId);
    }
    update () {
        this.Adapter.update();
    };
    remove () {
        User.Adapter.remove(this.username);
    }
    addCredential (credential:string){
        this._credentials.push(credential);
        this.Adapter.addCredential(credential);
        return this;
    }
    addCertificate (certificate:string){
        this._certificates.push(certificate);
        this.Adapter.addCertificate(certificate);
        return this;
    }
    addAuthenticator (authenticator:string){
        this._authenticators.push(authenticator);
        this.Adapter.addAuthenticator(authenticator);
        return this;
    }
    setProviderId (provider:string, id:string){
        switch(provider.toUpperCase()){
            case 'GOOGLE':
                this.googleId = id;
                break;
            case 'LIVE':
                this.liveId = id;
                break;
            case 'TWITTER':
                this.twitterId = id;
                break;
            default:
                throw `${provider} provider not supported`;
        }
        this.Adapter.setProviderId(provider, id);
        return this;
    }
    getProviderId (provider:string) {
        switch(provider.toUpperCase()){
            case 'GOOGLE':
                return this.googleId;
            case 'LIVE':
                return this.liveId;
            case 'TWITTER':
                return this.twitterId;
            default:
                throw `${provider} provider not supported`;
        }
    }
    toObject () {
        return {
            id: this.id,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            password: this.password,
            credentials: this._credentials,
            authenticators: this._authenticators,
            certificates: this._certificates,
            picture: this.picture,
            googleId: this.googleId,
            liveId: this.liveId,
            twitterId: this.twitterId,
            email_confirmed_at: this.email_confirmed_at,
            phone: this.phone,
            phone_confirmed_at: this.phone_confirmed_at,
            last_sign_in_at: this.last_sign_in_at,
            active: this.active,
            active_changed_at: this.active_changed_at,
            created_at: this.created_at,
            updated_at: this.updated_at
        }
    }
    stringify():string{
        return JSON.stringify(this.toObject())
    }
    toPublicObject () {
        return {
            id: this.id,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            displayName: this.displayName,
            initials: this.initials,
            picture: this.picture,
            googleId: this.googleId,
            liveId: this.liveId,
            twitterId: this.twitterId,
            phone: this.phone,
            active: this.active
        }
    }
}

const HASH_SALT = 'hashSalt';
const HASH_ALGORITHM = `sha512`;
const HASH_LENGTH = 64;
const HASH_ITERATIONS = 1000;

export const hashPassword = (password: string, passwordSalt: string): string => {
    const passwordHash: string = crypto.pbkdf2Sync(password, passwordSalt, HASH_ITERATIONS, HASH_LENGTH, HASH_ALGORITHM).toString(`hex`);
    return passwordHash;
}