import bootstrap, * as nemo from './nemo';
import 'dotenv/config'

export {nemo};

console.clear();

bootstrap(process.env, __dirname);
