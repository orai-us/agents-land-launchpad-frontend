import { PublicKey } from '@solana/web3.js';

// Program ID defined in the provided IDL. Do not edit, it will get overwritten.
export const PROGRAM_ID_IDL = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '6eo85FHrdd7cBzGNqWeseEnqSL5VS5Bk7NaecfGnb7iE');

// This constant will not get overwritten on subsequent code generations and it's safe to modify it's value.
export const PROGRAM_ID: PublicKey = PROGRAM_ID_IDL;
