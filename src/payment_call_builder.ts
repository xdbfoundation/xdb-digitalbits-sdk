import { CallBuilder } from "./call_builder";
import { ServerApi } from "./server_api";

/**
 * Creates a new {@link PaymentCallBuilder} pointed to server defined by serverUrl.
 *
 * Do not create this object directly, use {@link Server#payments}.
 * @see [All Payments](https://developers.digitalbits.io/reference/go/services/frontier/internal/docs/reference/endpoints/payments-all)
 * @constructor
 * @extends CallBuilder
 * @param {string} serverUrl Frontier server URL.
 */
export class PaymentCallBuilder extends CallBuilder<
  ServerApi.CollectionPage<ServerApi.PaymentOperationRecord>
> {
  constructor(serverUrl: URI) {
    super(serverUrl);
    this.url.segment("payments");
  }

  /**
   * This endpoint responds with a collection of Payment operations where the given account was either the sender or receiver.
   * @see [Payments for Account](https://developers.digitalbits.io/reference/go/services/frontier/internal/docs/reference/endpoints/payments-for-account)
   * @param {string} accountId For example: `GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD`
   * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
   */
  public forAccount(accountId: string): this {
    this.filter.push(["accounts", accountId, "payments"]);
    return this;
  }

  /**
   * This endpoint represents all payment operations that are part of a valid transactions in a given ledger.
   * @see [Payments for Ledger](https://developers.digitalbits.io/reference/go/services/frontier/internal/docs/reference/endpoints/payments-for-ledger)
   * @param {number|string} sequence Ledger sequence
   * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
   */
  public forLedger(sequence: number | string): this {
    this.filter.push([
      "ledgers",
      typeof sequence === "number" ? sequence.toString() : sequence,
      "payments",
    ]);
    return this;
  }

  /**
   * This endpoint represents all payment operations that are part of a given transaction.
   * @see [Payments for Transaction](https://developers.digitalbits.io/reference/go/services/frontier/internal/docs/reference/endpoints/payments-for-transaction)
   * @param {string} transactionId Transaction ID
   * @returns {PaymentCallBuilder} this PaymentCallBuilder instance
   */
  public forTransaction(transactionId: string): this {
    this.filter.push(["transactions", transactionId, "payments"]);
    return this;
  }
}
