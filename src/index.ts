import 'dotenv/config'
import bootstrap from '@core';
import UserAdapter from '@model_adapters/FileDB/User';
import path from 'path';

bootstrap
console.clear();

UserAdapter.setAdapter(path.join(__dirname,'./model_adapters/FileDB',  'users.json'), 'users');

bootstrap(__dirname);
