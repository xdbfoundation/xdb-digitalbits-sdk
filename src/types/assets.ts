import { AssetType } from "xdb-digitalbits-base";
import { Frontier } from "./../frontier_api";
export interface AssetRecord extends Frontier.BaseResponse {
  asset_type: AssetType.credit4 | AssetType.credit12;
  asset_code: string;
  asset_issuer: string;
  paging_token: string;
  accounts: Frontier.AssetAccounts;
  num_claimable_balances: number;
  balances: Frontier.AssetBalances;
  claimable_balances_amount: string;
  amount: string;
  num_accounts: number;
  flags: Frontier.Flags;
}
