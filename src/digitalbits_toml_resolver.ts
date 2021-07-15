import axios from "axios";
import toml from "toml";
import { Config } from "./config";

// DIGITALBITS_TOML_MAX_SIZE is the maximum size of digitalbits.toml file
export const DIGITALBITS_TOML_MAX_SIZE = 100 * 1024;

// axios timeout doesn't catch missing urls, e.g. those with no response
// so we use the axios cancel token to ensure the timeout
const CancelToken = axios.CancelToken;

/**
 * DigitalBitsTomlResolver allows resolving `digitalbits.toml` files.
 */
export class DigitalBitsTomlResolver {
  /**
   * Returns a parsed `digitalbits.toml` file for a given domain.
   * ```js
   * DigitalBitsSdk.DigitalBitsTomlResolver.resolve('livenet.digitalbits.io')
   *   .then(digitalBitsToml => {
   *     // digitalBitsToml in an object representing domain digitalbits.toml file.
   *   })
   *   .catch(error => {
   *     // digitalbits.toml does not exist or is invalid
   *   });
   * ```
   * @see <a href="https://developers.digitalbits.io/guides/concepts/digitalbits-toml.html" target="_blank">digitalbits.toml doc</a>
   * @param {string} domain Domain to get digitalbits.toml file for
   * @param {object} [opts] Options object
   * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
   * @returns {Promise} A `Promise` that resolves to the parsed digitalbits.toml object
   */
  public static async resolve(
    domain: string,
    opts: DigitalBitsTomlResolver.DigitalBitsTomlResolveOptions = {},
  ): Promise<{ [key: string]: any }> {
    const allowHttp =
      typeof opts.allowHttp === "undefined"
        ? Config.isAllowHttp()
        : opts.allowHttp;

    const timeout =
      typeof opts.timeout === "undefined" ? Config.getTimeout() : opts.timeout;

    const protocol = allowHttp ? "http" : "https";

    return axios
      .get(`${protocol}://${domain}/.well-known/digitalbits.toml`, {
        maxContentLength: DIGITALBITS_TOML_MAX_SIZE,
        cancelToken: timeout
          ? new CancelToken((cancel) =>
              setTimeout(
                () => cancel(`timeout of ${timeout}ms exceeded`),
                timeout,
              ),
            )
          : undefined,
        timeout,
      })
      .then((response) => {
        try {
          const tomlObject = toml.parse(response.data);
          return Promise.resolve(tomlObject);
        } catch (e) {
          return Promise.reject(
            new Error(
              `digitalbits.toml is invalid - Parsing error on line ${e.line}, column ${e.column}: ${e.message}`,
            ),
          );
        }
      })
      .catch((err: Error) => {
        if (err.message.match(/^maxContentLength size/)) {
          throw new Error(
            `digitalbits.toml file exceeds allowed size of ${DIGITALBITS_TOML_MAX_SIZE}`,
          );
        } else {
          throw err;
        }
      });
  }
}

/* tslint:disable-next-line: no-namespace */
export namespace DigitalBitsTomlResolver {
  export interface DigitalBitsTomlResolveOptions {
    allowHttp?: boolean;
    timeout?: number;
  }
}
