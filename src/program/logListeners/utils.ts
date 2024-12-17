import {
  ParsedInstruction,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";

export function findLogEntry(
  needle: string,
  logEntries: Array<string>
): string | null {
  for (let i = 0; i < logEntries.length; ++i) {
    if (logEntries[i].includes(needle)) {
      return logEntries[i];
    }
  }

  return null;
}

export function findInstructionByProgramId(
  instructions: Array<ParsedInstruction | PartiallyDecodedInstruction>,
  programId: PublicKey
): ParsedInstruction | PartiallyDecodedInstruction | null {
  for (let i = 0; i < instructions.length; i++) {
    if (instructions[i].programId.equals(programId)) {
      return instructions[i];
    }
  }
  return null;
}

export async function fetchJSONDataFromUrl(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();

    return json;
  } catch (error) {
    console.log("error", error);
    return {
      image: url,
    };
  }
}
