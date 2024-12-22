import { LIMIT_PAGINATION } from '@/config';
import UserContext from '@/context/UserContext';
import { coinInfo } from '@/utils/types';
import { getCoinsInfo } from '@/utils/util';
import { FC, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import FilterListToken, { SORT_LIST } from './FilterListToken';
import ListToken, { KeyByStatus, STATUS_TOKEN, TokenTab } from './ListToken';

// const getValue = (param) =>
//   new URLSearchParams(window.location.search).get(param);

const TAB_QUERY = 'tab';
const SEARCH_QUERY = 'keyword';

const HomePage: FC = () => {
  const { isLoading, setIsLoading, isCreated, solPrice, setSolPrice } =
    useContext(UserContext);
  const [changeTabLoading, setChangeTabLoading] = useState(false);
  const [token, setToken] = useState('');
  const [data, setData] = useState<coinInfo[]>(null);
  const [totalData, setTotalData] = useState<number>(0);
  const [dataSort, setDataSort] = useState<string>('dump order');
  const [isSort, setIsSort] = useState(0);
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const dropdownRef = useRef(null);
  const dropdownRef1 = useRef(null);
  const [location, setLocation] = useLocation();
  const [currentTab, setCurrentTab] = useState(KeyByStatus[STATUS_TOKEN.LUNCH]);

  // useEffect(() => {
  // const queryString = window.location.search;
  // const params = new URLSearchParams(queryString || "");
  // const keyword = params.get(SEARCH_QUERY);
  // const tab = params.get(TAB_QUERY);

  //   let pathname = location;
  //   if (tab) pathname += `?tab=${tab}`;
  //   if (!queryString || !keyword || !tab) return setLocation(pathname);

  //   if (keyword) {
  //     pathname = pathname += `?keyword=${keyword}`;
  //   }

  //   setLocation(pathname);
  // }, [window.location.search, location]);

  const [filterState, setFilterState] = useState<{
    label: string;
    value: string;
  }>(SORT_LIST[0]);

  useEffect(() => {
    let pathname = location;
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString || '');
    const keyword = params.get(SEARCH_QUERY);
    const tab = params.get(TAB_QUERY);

    if (
      !Object.values(TokenTab)
        .map((e) => e.value)
        .includes(currentTab)
    ) {
      // params.set(TAB_QUERY, KeyByStatus[STATUS_TOKEN.LUNCH]);
      pathname = `${pathname}?tab=${KeyByStatus[STATUS_TOKEN.LUNCH]}`;
    } else if (currentTab !== tab) {
      // params.set(TAB_QUERY, KeyByStatus[currentTab]);
      pathname = `${pathname}?tab=${currentTab}`;
    }
    if ((token || token === '') && token !== keyword) {
      pathname = `${pathname}?keyword=${token}`;
      // params.set(SEARCH_QUERY, token);
    }
    setLocation(pathname);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, token, location, window.location]);

  useEffect(() => {
    const fetchData = async () => {
      const { coins = [], total = 0 } = await getCoinsInfo({
        limit: LIMIT_PAGINATION,
        page,
        keyword: (token || '').trim(),
        listed: currentTab,
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
          sortedData.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
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
          sortedData.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        dropdownRef1.current &&
        !dropdownRef1.current.contains(event.target)
      ) {
        setIsSort(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, dropdownRef1]);

  return (
    <div className="w-full h-full gap-4 flex flex-col">
      <FilterListToken
        type={currentTab}
        setType={(tab) => {
          setCurrentTab(tab);
          setPage(0);
          setToken('');
          setData(null);
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
