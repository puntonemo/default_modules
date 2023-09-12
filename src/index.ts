import 'dotenv/config'
import bootstrap from 'core';
import UserAdapter from 'adapters/FileDB/User';
import path from 'path';

bootstrap
console.clear();

UserAdapter.setAdapter(path.join(__dirname,'./adapters/FileDB',  'users.json'), 'users');

bootstrap(__dirname);
