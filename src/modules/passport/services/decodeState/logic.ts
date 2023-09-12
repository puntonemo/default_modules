import { decrypt } from "modules/passport/tools";

export const decodeState = (state:string) => {
    const decodedState = decrypt(state);
    if(decodedState) return JSON.parse(decodedState);
    return undefined;
}
