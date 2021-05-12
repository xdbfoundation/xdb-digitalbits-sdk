import { Asset, AssetType } from "digitalbits-base";
import { Omit } from "utility-types";
import { Frontier } from "./frontier_api";

/* tslint:disable-next-line: no-namespace */
export namespace ServerApi {
  export interface CollectionPage<
    T extends Frontier.BaseResponse = Frontier.BaseResponse
  > {
    records: T[];
    next: () => Promise<CollectionPage<T>>;
    prev: () => Promise<CollectionPage<T>>;
  }

  export interface CallFunctionTemplateOptions {
    cursor?: string | number;
    limit?: number;
    order?: "asc" | "desc";
  }

  export type CallFunction<
    T extends Frontier.BaseResponse = Frontier.BaseResponse
  > = () => Promise<T>;
  export type CallCollectionFunction<
    T extends Frontier.BaseResponse = Frontier.BaseResponse
  > = (options?: CallFunctionTemplateOptions) => Promise<CollectionPage<T>>;

  export interface AccountRecordSigners {
    key: string;
    weight: number;
    type: string;
  }
  export interface AccountRecord extends Frontier.BaseResponse {
    id: string;
    paging_token: string;
    account_id: string;
    sequence: string;
    subentry_count: number;
    home_domain?: string;
    inflation_destination?: string;
    last_modified_ledger: number;
    thresholds: Frontier.AccountThresholds;
    flags: Frontier.Flags;
    balances: Frontier.BalanceLine[];
    signers: AccountRecordSigners[];
    data: (options: { value: string }) => Promise<{ value: string }>;
    data_attr: {
      [key: string]: string;
    };
    effects: CallCollectionFunction<EffectRecord>;
    offers: CallCollectionFunction<OfferRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    payments: CallCollectionFunction<PaymentOperationRecord>;
    trades: CallCollectionFunction<TradeRecord>;
  }

  export interface EffectRecord extends Frontier.BaseResponse {
    account: string;
    paging_token: string;
    type_i: string;
    type: string;
    created_at: string;
    id: string;

    // account_debited / credited / trustline_created
    amount?: any;
    asset_type?: string;
    asset_code?: string;
    asset_issuer?: string;

    // trustline_created / removed
    limit?: string;

    // signer_created
    public_key?: string;

    // trade
    offer_id?: number;
    bought_amount?: string;
    bought_asset_type?: string;
    bought_asset_code?: string;
    bought_asset_issuer?: string;
    sold_amount?: string;
    sold_asset_type?: string;
    sold_asset_code?: string;
    sold_asset_issuer?: string;

    // account_created
    starting_balance?: string;

    // These were retrieved from the go repo, not through direct observation
    // so they could be wrong!

    // account thresholds updated
    low_threshold?: number;
    med_threshold?: number;
    high_threshold?: number;

    // home domain updated
    home_domain?: string;

    // account flags updated
    auth_required_flag?: boolean;
    auth_revokable_flag?: boolean;

    // seq bumped
    new_seq?: number;

    // signer created / removed / updated
    weight?: number;
    key?: string;

    // trustline authorized / deauthorized
    trustor?: string;

    operation?: CallFunction<OperationRecord>;
    precedes?: CallFunction<EffectRecord>;
    succeeds?: CallFunction<EffectRecord>;
  }

  export interface LedgerRecord extends Frontier.BaseResponse {
    id: string;
    paging_token: string;
    hash: string;
    prev_hash: string;
    sequence: number;
    transaction_count: number;
    operation_count: number;
    closed_at: string;
    total_coins: string;
    fee_pool: string;
    base_fee: number;
    base_reserve: string;
    max_tx_set_size: number;
    protocol_version: number;
    header_xdr: string;
    base_fee_in_stroops: number;
    base_reserve_in_stroops: number;

    effects: CallCollectionFunction<EffectRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    self: CallFunction<LedgerRecord>;
    transactions: CallCollectionFunction<TransactionRecord>;
  }

  export interface OfferAsset {
    asset_type: AssetType;
    asset_code?: string;
    asset_issuer?: string;
  }

  export interface OfferRecord extends Frontier.BaseResponse {
    id: string;
    paging_token: string;
    seller: string;
    selling: OfferAsset;
    buying: OfferAsset;
    amount: string;
    price_r: Frontier.PriceRShorthand;
    price: string;
    last_modified_ledger: number;
    last_modified_time: string;
  }

  import OperationResponseType = Frontier.OperationResponseType;
  import OperationResponseTypeI = Frontier.OperationResponseTypeI;
  export interface BaseOperationRecord<
    T extends OperationResponseType = OperationResponseType,
    TI extends OperationResponseTypeI = OperationResponseTypeI
  > extends Frontier.BaseOperationResponse<T, TI> {
    self: CallFunction<OperationRecord>;
    succeeds: CallFunction<OperationRecord>;
    precedes: CallFunction<OperationRecord>;
    effects: CallCollectionFunction<EffectRecord>;
    transaction: CallFunction<TransactionRecord>;
  }

  export interface CreateAccountOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.createAccount,
        OperationResponseTypeI.createAccount
      >,
      Frontier.CreateAccountOperationResponse {}
  export interface PaymentOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.payment,
        OperationResponseTypeI.payment
      >,
      Frontier.PaymentOperationResponse {
    sender: CallFunction<AccountRecord>;
    receiver: CallFunction<AccountRecord>;
  }
  export interface PathPaymentOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.pathPayment,
        OperationResponseTypeI.pathPayment
      >,
      Frontier.PathPaymentOperationResponse {}
  export interface ManageOfferOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.manageOffer,
        OperationResponseTypeI.manageOffer
      >,
      Frontier.ManageOfferOperationResponse {}
  export interface PassiveOfferOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.createPassiveOffer,
        OperationResponseTypeI.createPassiveOffer
      >,
      Frontier.PassiveOfferOperationResponse {}
  export interface SetOptionsOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.setOptions,
        OperationResponseTypeI.setOptions
      >,
      Frontier.SetOptionsOperationResponse {}
  export interface ChangeTrustOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.changeTrust,
        OperationResponseTypeI.changeTrust
      >,
      Frontier.ChangeTrustOperationResponse {}
  export interface AllowTrustOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.allowTrust,
        OperationResponseTypeI.allowTrust
      >,
      Frontier.AllowTrustOperationResponse {}
  export interface AccountMergeOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.accountMerge,
        OperationResponseTypeI.accountMerge
      >,
      Frontier.AccountMergeOperationResponse {}
  export interface InflationOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.inflation,
        OperationResponseTypeI.inflation
      >,
      Frontier.InflationOperationResponse {}
  export interface ManageDataOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.manageData,
        OperationResponseTypeI.manageData
      >,
      Frontier.ManageDataOperationResponse {}
  export interface BumpSequenceOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.bumpSequence,
        OperationResponseTypeI.bumpSequence
      >,
      Frontier.BumpSequenceOperationResponse {}

  export type OperationRecord =
    | CreateAccountOperationRecord
    | PaymentOperationRecord
    | PathPaymentOperationRecord
    | ManageOfferOperationRecord
    | PassiveOfferOperationRecord
    | SetOptionsOperationRecord
    | ChangeTrustOperationRecord
    | AllowTrustOperationRecord
    | AccountMergeOperationRecord
    | InflationOperationRecord
    | ManageDataOperationRecord
    | BumpSequenceOperationRecord;

  export interface TradeRecord extends Frontier.BaseResponse {
    id: string;
    paging_token: string;
    ledger_close_time: string;
    offer_id: string;
    base_offer_id: string;
    base_account: string;
    base_amount: string;
    base_asset_type: string;
    base_asset_code?: string;
    base_asset_issuer?: string;
    counter_offer_id: string;
    counter_account: string;
    counter_amount: string;
    counter_asset_type: string;
    counter_asset_code?: string;
    counter_asset_issuer?: string;
    base_is_seller: boolean;

    base: CallFunction<AccountRecord>;
    counter: CallFunction<AccountRecord>;
    operation: CallFunction<OperationRecord>;
  }

  export interface TransactionRecord
    extends Omit<Frontier.TransactionResponse, "ledger"> {
    ledger_attr: Frontier.TransactionResponse["ledger"];

    account: CallFunction<AccountRecord>;
    effects: CallCollectionFunction<EffectRecord>;
    ledger: CallFunction<LedgerRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    precedes: CallFunction<TransactionRecord>;
    self: CallFunction<TransactionRecord>;
    succeeds: CallFunction<TransactionRecord>;
  }

  export interface AssetRecord extends Frontier.BaseResponse {
    asset_type: AssetType.credit4 | AssetType.credit12;
    asset_code: string;
    asset_issuer: string;
    paging_token: string;
    amount: string;
    num_accounts: number;
    flags: Frontier.Flags;
  }

  export interface OrderbookRecord extends Frontier.BaseResponse {
    bids: Array<{
      price_r: {
        d: number;
        n: number;
      };
      price: string;
      amount: string
    }>;
    asks: Array<{
      price_r: {
        d: number;
        n: number;
      };
      price: string;
      amount: string
    }>;
    base: Asset;
    counter: Asset;
  }

  export interface PaymentPathRecord extends Frontier.BaseResponse {
    path: Array<{
      asset_code: string;
      asset_issuer: string;
      asset_type: string;
    }>;
    source_amount: string;
    source_asset_type: string;
    source_asset_code: string;
    source_asset_issuer: string;
    destination_amount: string;
    destination_asset_type: string;
    destination_asset_code: string;
    destination_asset_issuer: string;
  }
}
