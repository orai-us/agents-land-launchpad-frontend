import { FC, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PiLightning } from 'react-icons/pi';
import UserContext from '@/context/UserContext';
import { coinInfo } from '@/utils/types';
import { getCoinsInfo, getSolPriceInUSD } from '@/utils/util';
import { CoinBlog } from '../cards/CoinBlog';
import TopToken from './TopToken';
import FilterList from './FilterList';
import ListToken, { STATUS_TOKEN, TokenTab } from './ListToken';
import FilterListToken, { SORT_LIST } from './FilterListToken';
import { LIMIT_PAGINATION } from '@/config';
import BigNumber from 'bignumber.js';
import { useLocation } from 'wouter';

const HomePage: FC = () => {
  const { isLoading, setIsLoading, isCreated, solPrice, setSolPrice } = useContext(UserContext);
  const [changeTabLoading, setChangeTabLoading] = useState(false);
  const [token, setToken] = useState('');
  const [data, setData] = useState<coinInfo[]>([]);
  const [totalData, setTotalData] = useState<number>(0);
  const [dataSort, setDataSort] = useState<string>('dump order');
  const [isSort, setIsSort] = useState(0);
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const dropdownRef = useRef(null);
  const dropdownRef1 = useRef(null);
  // const [, setLocation] = useLocation();
  const [, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState(STATUS_TOKEN.LUNCH);

  const [filterState, setFilterState] = useState<{
    label: string;
    value: string;
  }>(SORT_LIST[0]);

  const handleToRouter = (id: string) => {
    setLocation(id);
  };

  useEffect(() => {
    if (
      !Object.values(TokenTab)
        .map((e) => e.value)
        .includes(currentTab)
    ) {
      setLocation(`/?tab=${STATUS_TOKEN.LUNCH}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  useEffect(() => {
    const fetchData = async () => {
      const { coins = [], total = 0 } = await getCoinsInfo({
        limit: LIMIT_PAGINATION,
        page,
        keyword: (token || '').trim(),
        listed: currentTab === STATUS_TOKEN.LISTED,
        sortBy: filterState.value
      });
      if (coins !== null) {
        setTotalData(total);
        setData((data) => {
          if (page) {
            return [...data, ...coins];
          }
          return coins;
        });
        setIsLoading(true);
      }
    };
    fetchData();
  }, [page, token, currentTab, filterState]);

  const handleSortSelection = (option) => {
    let sortOption: string = '';
    let orderOption: string = '';
    let sortedData = [...data]; // Create a new array to prevent direct state mutation
    if (option == 'desc' || option == 'asc') {
      setOrder(option);
      sortOption = dataSort;
      orderOption = option;
    } else {
      setDataSort(option);
      sortOption = option;
      orderOption = order;
    }
    if (orderOption == 'desc') {
      switch (sortOption) {
        case 'bump order':
          sortedData.sort((a, b) => +a.tokenReserves - +b.tokenReserves);
          break;
        case 'last reply':
          sortedData.sort((a, b) => +a.tokenReserves - +b.tokenReserves);
          break;
        case 'reply count':
          sortedData.sort((a, b) => +a.tokenReserves - +b.tokenReserves);
          break;
        case 'market cap':
          sortedData.sort((a, b) => +a.tokenReserves - +b.tokenReserves);
          break;
        case 'creation time':
          sortedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        default:
          sortedData = data;
          break;
      }
    } else {
      switch (sortOption) {
        case 'bump order':
          sortedData.sort((a, b) => +b.tokenReserves - +a.tokenReserves);
          break;
        case 'last reply':
          sortedData.sort((a, b) => +b.tokenReserves - +a.tokenReserves);
          break;
        case 'reply count':
          sortedData.sort((a, b) => +b.tokenReserves - +a.tokenReserves);
          break;
        case 'market cap':
          sortedData.sort((a, b) => +b.tokenReserves - +a.tokenReserves);
          break;
        case 'creation time':
          sortedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          break;
        default:
          sortedData = data;
          break;
      }
    }
    setData(sortedData);
    setIsSort(0); // Close the dropdown after selection
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && dropdownRef1.current && !dropdownRef1.current.contains(event.target)) {
        setIsSort(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, dropdownRef1]);

  // console.log("data", data);

  return (
    <div className="w-full h-full gap-4 flex flex-col">
      <FilterListToken
        type={currentTab}
        setType={(tab) => {
          setCurrentTab(tab);
          setPage(0);
          setToken('');
          setData([]);
          setFilterState(SORT_LIST[0]);
        }}
        setSearch={(e) => {
          setToken(e);
          setPage(0);
        }}
        filterState={filterState}
        setFilterState={(e) => {
          setPage(0);
          setFilterState(e);
        }}
      />

      <ListToken
        type={currentTab}
        data={data}
        handleLoadMore={() => setPage((page) => page + 1)}
        totalData={totalData}
      />
    </div>
  );
};
export default HomePage;
