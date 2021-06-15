import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link LedgerCallBuilder} pointed to server defined by serverUrl.
 * Do not create this object directly, use {@link Server#ledgers}.
 *
 * @see [All Ledgers](https://developers.digitalbits.io/reference/go/services/frontier/internal/docs/reference/endpoints/ledgers-all)
 * @constructor
 * @class LedgerCallBuilder
 * @extends CallBuilder
 * @param {string} serverUrl Frontier server URL.
 */
export class LedgerCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.LedgerRecord>
> {
  constructor(serverUrl: URI) {
    super(serverUrl);
    this.url.segment("ledgers");
  }

  /**
   * Provides information on a single ledger.
   * @param {number|string} sequence Ledger sequence
   * @returns {LedgerCallBuilder} current LedgerCallBuilder instance
   */
  public ledger(sequence: number | string): this {
    this.filter.push(["ledgers", sequence.toString()]);
    return this;
  }
}
