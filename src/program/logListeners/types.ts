export interface SubscibeProgramLogs {
  /**
   *
   * @param programId Solana program Id in base58
   * @param callbacks a map of callbacks to handle specific log cases
   * @returns subscription ID to cancel
   */
  subscribeProgramLogs(
    programId: string,
    callbacks: Record<string, Function>
  ): number;
}
