import { AssetType } from "xdb-digitalbits-base";
import { Frontier } from "./../frontier_api";

export interface OfferAsset {
  asset_type: AssetType;
  asset_code?: string;
  asset_issuer?: string;
}

export interface OfferRecord extends Frontier.BaseResponse {
  id: number | string;
  paging_token: string;
  seller: string;
  selling: OfferAsset;
  buying: OfferAsset;
  amount: string;
  price_r: Frontier.PriceRShorthand;
  price: string;
  last_modified_ledger: number;
  last_modified_time: string;
  sponsor?: string;
}
