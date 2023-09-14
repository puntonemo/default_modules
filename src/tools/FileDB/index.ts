
import fs from 'fs';
import { GenericObject } from 'core';

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
    getAll(collectionName:string) {
        const data = this.db[collectionName] || {};
        let resultsArray = []
        for(const item in data){
            resultsArray.push(data[item]);
        }
        return resultsArray;
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
    delete(collectionName:string, key:string){
        if(!this.db[collectionName]) this.db[collectionName] = {};
        delete this.db[collectionName][key];
        this.writeChanges();
    }
    private writeChanges() {
        fs.writeFileSync(this.filename, JSON.stringify(this.db), 'utf-8');
    }
}