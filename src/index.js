require('es6-promise').polyfill();

// digitalbits-sdk classes to expose
export * from "./errors";
export {Config} from "./config";
export {Server} from "./server";
export {FederationServer, FEDERATION_RESPONSE_MAX_SIZE} from "./federation_server";
export {DigitalBitsTomlResolver, DIGITALBITS_TOML_MAX_SIZE} from "./digitalbits_toml_resolver";

// expose classes and functions from digitalbits-base
export * from "digitalbits-base";

export default module.exports;
