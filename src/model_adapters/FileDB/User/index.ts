import { GenericObject } from "core";
import User from "model/User";
import { IUser, IUserAdapter, IUserInstanceAdapter } from "@model/User/adapter";

import FileDB from "tools/FileDB";

let fileDB:FileDB|undefined = undefined;
let fileName = 'users.json'
let collectionName = 'users';

// Interface for Database Connection
interface IUserAdapterConnection {
    setAdapter (fileName?:string, userCollectionName?:string):void;
}
const getUserInstance = async (fileDBData:GenericObject): Promise<IUser> => {
    const user =  new User(
        fileDBData.id, 
        fileDBData.username, 
        fileDBData.firstName, 
        fileDBData.lastName, 
        fileDBData.password, 
        fileDBData.picture, 
        undefined, 
        undefined, 
        fileDBData.authenticators, 
        fileDBData.credentials, 
        fileDBData.certificates,
        fileDBData.email_confirmed_at,
        fileDBData.phone,
        fileDBData.phone_confirmed_at,
        fileDBData.last_sign_in_at,
        fileDBData.active,
        fileDBData.active_changed_at
    )
    user.googleId = fileDBData.googleId;
    user.liveId = fileDBData.liveId;
    user.twitterId = fileDBData.twitterId;
    user.created_at = fileDBData.created_at;
    user.updated_at = fileDBData.updated_at;

    return user;
}
// Adapter implementation
const Adapter:IUserAdapter & IUserAdapterConnection = {
    // Retrieve instance adapter
    getAdapter(user:IUser) {
        return new UserInstanceAdapter(user);
    },
    // Implement database connection
    setAdapter(userFileName?:string, userCollectionName?:string) {
        if(userFileName) fileName = userFileName;
        if(userCollectionName) collectionName = userCollectionName;
        fileDB = new FileDB(fileName);
        User.setAdapter(this);
    },
    // Implement static adapter
    async get(username:string):Promise<IUser | undefined> {
        if(fileDB){
            const fileDBData = fileDB.getValue(collectionName, username) as GenericObject;
            if(fileDBData){
                return getUserInstance(fileDBData);
            }else{
                return undefined;
            }
            
        }else{
            throw "User FileDB Adapter not set"
        }
    },
    async getById(id:number):Promise<IUser | undefined> {
        if(fileDB){
            const fileDBDataCollection = fileDB.collection(collectionName) as GenericObject;
            
            for (const item in fileDBDataCollection){
                const fileDBData = fileDBDataCollection[item];
                if(fileDBData.id == id){
                    return getUserInstance(fileDBData);
                }
            }
            return undefined;            
        }else{
            throw "User FileDB Adapter not set"
        }
    },
    async getAll():Promise<IUser[]> {
        if(fileDB){
            const fileDBData = fileDB.getAll(collectionName) as IUser[];
            return fileDBData || [];
        }else{
            throw "UserRole FileDB Adapter not set"
        }
    },
    async remove(username:string):Promise<void> {
        if(fileDB){
            fileDB.delete(collectionName, username);
        }else{
            throw "UserRole FileDB Adapter not set"
        }
    },
    async usernameByCertificate(certificate:string): Promise<string> {
        if(fileDB){
            return fileDB.getValue('certificates', certificate)
        }else{
            throw "User FileDB Adapter not set"
        }
    },
    
    async usernameByCredential(credential:string): Promise<string> {
        if(fileDB){
            return fileDB.getValue('credentials', credential);
        }else{
            throw "User FileDB Adapter not set"
        }
    }
}
// Instance adapter implementation
class UserInstanceAdapter extends IUserInstanceAdapter{
    override create(): number {
        this.instance.id = Date.now();
        this.instance.created_at = Date.now();
        if(fileDB)
            fileDB.setValue(collectionName, this.instance.username, this.instance.toObject());
        return this.instance.id;
    }
    override update(): void {
        this.instance.updated_at = Date.now();
        if(fileDB)
        fileDB.setValue(collectionName, this.instance.username, this.instance.toObject());
    }
    override remove(): void {
        
    }
    override addCredential(credential: string): void {
        this.instance.updated_at = Date.now();
        if(fileDB)
        {
            fileDB.setValue('credentials', credential, this.instance.username);
            fileDB.setValue(collectionName, this.instance.username, this.instance.toObject());
        }
    }
    override addCertificate(certificate: string): void {
        this.instance.updated_at = Date.now();
        if(fileDB)
        {
            fileDB.setValue('certificates', certificate, this.instance.username);
            fileDB.setValue(collectionName, this.instance.username, this.instance.toObject());
        }
    }
    override addAuthenticator(authenticator: string): void {
        this.instance.updated_at = Date.now();
        if(fileDB)
        {
            fileDB.setValue('authenticators', authenticator, this.instance.username);
            fileDB.setValue(collectionName, this.instance.username, this.instance.toObject());
        }
    }
    override setProviderId(_provider: string, _idº: string): void {
        this.instance.updated_at = Date.now();
        if(fileDB)
            fileDB.setValue(collectionName, this.instance.username, this.instance.toObject());
    }
}
// Export adapter
export default Adapter;