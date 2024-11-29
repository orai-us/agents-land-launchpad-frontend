import { Connection } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import { Pumpfun } from "../pumpfun";
import { ResultType } from "./types";
import { Metaplex } from "@metaplex-foundation/js";
import idl from "../pumpfun.json";

export class AgentsLandEventListener {
  private readonly pumpProgramInterface = JSON.parse(
    JSON.stringify(idl)
  ) as Pumpfun;
  private readonly eventNames = this.pumpProgramInterface.events.map(
    (e) => e.name
  );
  private callbacks: Record<(typeof this.eventNames)[0], {callback: Function, args: Array<any>}> = {} as any;

  constructor(private readonly connection: Connection) {}

  setProgramEventCallback(
    eventName: (typeof this.eventNames)[0],
    callback: Function,
    args: Array<any>,
  ) {
    this.callbacks[eventName] = {callback, args};
  }

  listenProgramEvents(programId: string) {
    if (!programId) {
      console.error("Program Id is empty");
      return { program: null, listenerIds: [] };
    }

    const program = new Program(this.pumpProgramInterface, {
      connection: this.connection as any,
    }) as Program<Pumpfun>;

    const swapId = program.addEventListener(
      "swapEvent",
      async (event, _, signature) => {
        try {
          const coinStatusResult: ResultType = {
            tx: signature,
            mint: event.mint.toBase58(),
            user: event.user.toBase58(),
            swapDirection: event.direction,
            lamportAmount:
              event.direction === 0 ? event.amountIn : event.amountOut,
            tokenAmount:
              event.direction === 0 ? event.amountOut : event.amountIn,
            tokenReserves: event.reserveToken,
            lamportReserves: event.reserveLamport,
          };

          const handler = this.callbacks['swapEvent'];
          console.log("handler args: ", handler.args);
          await handler.callback(coinStatusResult, ...handler.args);
        } catch (error) {
          console.error("error processing real-time swap tx: ", error);
        }
      }
    );

    console.log("Listener added with ID:", swapId);
    return { program, listenerIds: [swapId] };
  }
}
