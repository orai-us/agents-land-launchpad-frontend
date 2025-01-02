import axios from 'axios';
import { ChartTable } from './types';
import { BACKEND_URL, config } from './util';

export async function getChartTable({
  pairIndex,
  from,
  to,
  range,
  token,
  countBack,
}: {
  pairIndex: number;
  from: number;
  to: number;
  range: number;
  token: string;
  countBack: number;
}): Promise<ChartTable> {
  try {
    const res = await axios.get(
      `${BACKEND_URL}/chart/${pairIndex}/${from}/${to}/${range}/${token}/${countBack}`,
      { ...config },
    );

    if (!res) {
      throw new Error('Get chart failed!');
    }
    return res.data as ChartTable;
  } catch (err) {
    console.log('error get chart', err);
    return {
      table: [],
      raw: [],
    };
  }
}
