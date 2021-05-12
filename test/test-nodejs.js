/* eslint-disable no-undef */

require("babel-register");
global.DigitalBitsSdk = require("../lib/");
global.axios = require("axios");
global.FrontierAxiosClient = DigitalBitsSdk.FrontierAxiosClient;
var chaiAsPromised = require("chai-as-promised");
global.chai = require("chai");
global.chai.should();
global.chai.use(chaiAsPromised);
global.sinon = require("sinon");
global.expect = global.chai.expect;
