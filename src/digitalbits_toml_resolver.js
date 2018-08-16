import axios from 'axios';
import Promise from 'bluebird';
import toml from 'toml';
import {Config} from "./config";

// DIGITALBITS_TOML_MAX_SIZE is the maximum size of digitalbits.toml file
export const DIGITALBITS_TOML_MAX_SIZE = 100 * 1024;

/**
 * DigitalBitsTomlResolver allows resolving `digitalbits.toml` files.
 */
export class DigitalBitsTomlResolver {
  /**
   * Returns a parsed `digitalbits.toml` file for a given domain.
   * Returns a `Promise` that resolves to the parsed digitalbits.toml object. If `digitalbits.toml` file does not exist for a given domain or is invalid Promise will reject.
   * ```js
   * DigitalBitsSdk.DigitalBitsTomlResolver.resolve('acme.com')
   *   .then(digitalBitsToml => {
   *     // digitalBitsToml in an object representing domain digitalbits.toml file.
   *   })
   *   .catch(error => {
   *     // digitalbits.toml does not exist or is invalid
   *   });
   * ```
   * @see <a href="https://developer.digitalbits.io/learn/concepts/digitalbits-toml.html" target="_blank">Digitalbits.toml doc</a>
   * @param {string} domain Domain to get digitalbits.toml file for
   * @param {object} [opts]
   * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @returns {Promise}
   */
  static resolve(domain, opts = {}) {
    let allowHttp = Config.isAllowHttp();
    if (typeof opts.allowHttp !== 'undefined') {
        allowHttp = opts.allowHttp;
    }

    let protocol = 'https';
    if (allowHttp) {
        protocol = 'http';
    }
    return axios.get(`${protocol}://${domain}/.well-known/digitalbits.toml`, {maxContentLength: DIGITALBITS_TOML_MAX_SIZE})
      .then(response => {
      	try {
            let tomlObject = toml.parse(response.data);
            return Promise.resolve(tomlObject);
        } catch (e) {
            return Promise.reject(new Error(`Parsing error on line ${e.line}, column ${e.column}: ${e.message}`));
        }
      })
      .catch(err => {
        if (err.message.match(/^maxContentLength size/)) {
          throw new Error(`digitalbits.toml file exceeds allowed size of ${DIGITALBITS_TOML_MAX_SIZE}`);
        } else {
          throw err;
        }
      });
  }
}
