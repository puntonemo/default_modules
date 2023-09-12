import { GenericObject } from "core";
import User, { IUser } from "model/User";
import { IUserAdapter, IUserInstanceAdapter } from "model/User/Adapter";

import FileDB from "tools/FileDB";

let fileDB:FileDB|undefined = undefined;
let fileName = 'users.json'
let collectionName = 'users';

// Interface for Database Connection
interface IUserAdapterConnection {
    setAdapter (fileName?:string, userCollectionName?:string):void;
}

// Adapter implementation
const UserAdapter:IUserAdapter & IUserAdapterConnection = {
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
            const userData = fileDB.getValue(collectionName, username) as GenericObject;
            if(userData){
                const user =  new User(userData.id, userData.username, userData.firstName, userData.lastName, userData.password, userData.picture, userData.provider, userData.providerId, userData.authenticators, userData.credentials, userData.certificates)
                return user;
            }else{
                return undefined;
            }
            
        }else{
            throw "User FileDB Adapter not set"
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
    override newUser(): void {
        if(fileDB)
            fileDB.setValue('users', this.user.username, this.user.toObject());
    }
    override addCredential(credential: string): void {
        if(fileDB)
        {
            fileDB.setValue('credentials', credential, this.user.username);
            fileDB.setValue('users', this.user.username, this.user.toObject());
        }
    }
    override addCertificate(certificate: string): void {
        if(fileDB)
        {
            fileDB.setValue('certificates', certificate, this.user.username);
            fileDB.setValue('users', this.user.username, this.user.toObject());
        }
    }
    override addAuthenticator(authenticator: string): void {
        if(fileDB)
        {
            fileDB.setValue('authenticators', authenticator, this.user.username);
            fileDB.setValue('users', this.user.username, this.user.toObject());
        }
    }
    override setProviderId(_provider: string, _idº: string): void {
        if(fileDB)
            fileDB.setValue('users', this.user.username, this.user.toObject());
    }
}
// Export adapter
export default UserAdapter;