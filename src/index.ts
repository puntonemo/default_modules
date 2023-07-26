import bootstrap, * as core from './core';
import 'dotenv/config'

/******************************************************************************************/
/* ShortHands                                                                             */
type ClientRequest = core.ClientRequest
const responseError = core.responseError;
const fetch = core.fetch;
type Service = core.Service;
type GenericObject = core.GenericObject;
const Session = core.Session
export {core, Service, ClientRequest, GenericObject, responseError, fetch, Session};
/******************************************************************************************/

console.clear();

bootstrap(process.env, __dirname);
