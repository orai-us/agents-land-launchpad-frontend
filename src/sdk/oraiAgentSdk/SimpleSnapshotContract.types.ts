export type Addr = string;
export interface InstantiateMsg {
  owner: Addr;
}
export type ExecuteMsg =
  | {
      whitelist: {
        slot: number;
        stakers: Staker[];
        token: string;
      };
    }
  | {
      store_number_slot: {
        num_slot: number;
        token: string;
      };
    }
  | {
      store_token_metadata: {
        metadata: Binary;
        token: string;
      };
    }
  | {
      remove_token_metadata: {
        token: string;
      };
    };
export type Uint128 = string;
export type Binary = string;
export interface Staker {
  addr: string;
  amount: Uint128;
}
export type QueryMsg =
  | {
      stakers: {
        slot: number;
        token: string;
      };
    }
  | {
      number_slot: {
        token: string;
      };
    }
  | {
      token_metadata: {
        token: string;
      };
    }
  | {
      tokens_metadata: {};
    };
export type ArrayOfUint64 = number[];
export type ArrayOfStaker = Staker[];
export type ArrayOfTokensMetadataResponse = TokensMetadataResponse[];
export interface TokensMetadataResponse {
  metadata: Binary;
  token: string;
}
