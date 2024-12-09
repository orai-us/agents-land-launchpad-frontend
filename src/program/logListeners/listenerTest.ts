import { AgentsLandListener } from '@/program/logListeners/AgentsLandListener';
import { Connection } from '@solana/web3.js';
import dotenv from 'dotenv';
dotenv.config();

const connection = new Connection(import.meta.env.VITE_SOLANA_RPC, {
  wsEndpoint: import.meta.env.VITE_SOLANA_WS,
  commitment: 'confirmed'
});
const listener = new AgentsLandListener(connection);

async function testListenToLogs() {
  listener.setProgramLogsCallback('Launch', (data: any) => {
    console.log('data: ', data);
  });
  listener.setProgramLogsCallback('Swap', (data: any) => {
    console.log('swap data: ', data);
  });
  listener.subscribeProgramLogs(import.meta.env.VITE_PROGRAM_ID);
}

// testListenToLogs();
