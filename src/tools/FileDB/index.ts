
import fs from 'fs';
import { nemo } from '../..';

type GenericObject = nemo.GenericObject;


export default class FileDB {
    private db:GenericObject = {};
    constructor(private filename:string) {
        if(fs.existsSync(filename)){
            this.db = JSON.parse(fs.readFileSync(filename, 'utf8'));
        }
    }
    collection(collectionName:string) {
        return this.db[collectionName]
    }
    getValue(collectionName:string, key:string) {
        if(!this.db[collectionName]) return undefined;
        return this.db[collectionName][key];
    }
    setValue(collectionName:string, key:string, value:GenericObject|string){
        if(!this.db[collectionName]) this.db[collectionName] = {};
        this.db[collectionName][key] = value;
        this.writeChanges();
    }
    private writeChanges() {
        fs.writeFileSync(this.filename, JSON.stringify(this.db), 'utf-8');
    }
}