import { IUser, IUserAdapter, IUserInstanceAdapter } from "./Adapter";
export { IUser, IUserAdapter, IUserInstanceAdapter }

export default class User implements IUser {
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
    // ADAPTERS
    private static Adapter:IUserAdapter;
    private Adapter:IUserInstanceAdapter;
    // CONSTRUCTOR
    constructor(id:number, username:string, firstName:string, lastName:string, password?:string, picture?:string, provider?:string, providerId?:string, authenticators?:string[], credentials?:string[], certificates?:string[]){
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
        if(provider && providerId){
            this.setProviderId(provider, providerId);
        }
        if(id == 0) {
            this.id = Date.now();
            this.Adapter.newUser();
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

    findCredential (credentialId:string) {
        return this._credentials.find((val:string)=>val == credentialId);
    }
    findCertificate (certificateId:string) {
        return this._certificates.find((val:string)=>val == certificateId);
    }
    findAuthenticator (authenticatorId:string) {
        return this._authenticators.find((val:string)=>val == authenticatorId);
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
            twitterId: this.twitterId
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
            googleId: this.googleId
        }
    }
}