// tslint:disable-next-line: no-reference
/// <reference path="../types/dom-monkeypatch.d.ts" />

/* tslint:disable:no-var-requires */
require("es6-promise").polyfill();
const version = require("../package.json").version;

// Expose all types
export * from "./frontier_api";
export * from "./server_api";

// xdb-digitalbits-sdk classes to expose
export * from "./account_response";
export * from "./errors";
export { Config } from "./config";
export { Server } from "./server";
export {
  FederationServer,
  FEDERATION_RESPONSE_MAX_SIZE,
} from "./federation_server";
export {
  DigitalBitsTomlResolver,
  DIGITALBITS_TOML_MAX_SIZE,
} from "./digitalbits_toml_resolver";
export {
  default as FrontierAxiosClient,
  SERVER_TIME_MAP,
  getCurrentServerTime,
} from "./frontier_axios_client";
export * from "./utils";

// expose classes and functions from xdb-digitalbits-base
export * from "xdb-digitalbits-base";

export { version };

export default module.exports;
