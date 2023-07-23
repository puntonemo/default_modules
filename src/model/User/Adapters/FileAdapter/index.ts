import User from "../.."
import { IUserAdapter, IUserAdapterStatic } from "../UserAdapter";
import FileDB from "../../../../tools/FileDB";
import path from 'path';

const fileDB = new FileDB(path.join(__dirname, 'database.json'))

/**
 * FileAdapter implementation for User
 */
export const UserAdapterStatic:IUserAdapterStatic = {
    async get (username:string): Promise<User | undefined> {
        const userDB = fileDB.getValue('users', username);
        if(userDB){
            const user = new User(
                userDB.id,
                userDB.username,
                userDB.firstName, 
                userDB.lastName,
                userDB.password,
                userDB.picture,
                undefined,
                undefined,
                userDB.authenticators as string[] ?? [],
                userDB.credentials as string[] ?? [],
                userDB.certificates as string[] ?? [],
                )
            user.googleId = userDB.googleId;
            user.liveId = userDB.liveId;
            user.twitterId = userDB.twitterId;
            return user;
        }else{
            return undefined;
        }
    },
    async usernameByCertificate(certificate:string): Promise<string> {
        return fileDB.getValue('certificates', certificate)
    },
    async usernameByCredential(credential:string): Promise<string> {
        return fileDB.getValue('credentials', credential);
    }
}
export class UserAdapter extends IUserAdapter{
    override newUser(): void {
        fileDB.setValue('users', this.user.username, this.user.toObject());
    }
    override addCredential(credential: string): void {
        fileDB.setValue('credentials', credential, this.user.username);
        fileDB.setValue('users', this.user.username, this.user.toObject());
    }
    override addCertificate(certificate: string): void {
        fileDB.setValue('certificates', certificate, this.user.username);
        fileDB.setValue('users', this.user.username, this.user.toObject());
    }
    override addAuthenticator(authenticator: string): void {
        fileDB.setValue('authenticators', authenticator, this.user.username);
        fileDB.setValue('users', this.user.username, this.user.toObject());
    }
    override setProviderId(_provider: string, _idº: string): void {
        fileDB.setValue('users', this.user.username, this.user.toObject());
    }
}
