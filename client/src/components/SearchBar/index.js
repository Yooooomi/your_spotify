import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Popper,
  Paper,
  ClickAwayListener,
  useMediaQuery,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import s from './index.module.css';
import API from '../../services/API';
import { lessThanMobile } from '../../services/theme';

function SearchBar() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState(null);
  const anchorEl = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    async function dosearch() {
      try {
        if (timeoutRef.current === null) return;
        const { data: rslts } = await API.searchArtists(search);
        setResults(rslts);
      } catch (e) {
        console.error(e);
      }
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(dosearch, 500);
  }, [search]);

  const updateSearch = useCallback(ev => {
    setSearch(ev.target.value);
  }, []);

  const close = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setResults(null);
    setSearch('');
  }, []);

  const blur = useCallback(() => {
    if (!results) return close();
    return null;
  }, [results, close]);

  const mobile = useMediaQuery(lessThanMobile);

  return (
    <div className={s.root}>
      <div className={s.inputcontainer} ref={anchorEl}>
        <SearchIcon />
        <input
          onBlur={blur}
          className={s.input}
          placeholder="Search for an artist"
          value={search}
          onChange={updateSearch}
        />
      </div>
      <Popper
        style={{ zIndex: 10000 }}
        placement="bottom"
        anchorEl={anchorEl.current}
        open={!!results}
      >
        <ClickAwayListener
          onClickAway={close}
        >
          <Paper className={s.paper}>
            {results && results.length === 0 && (
              <div>
                No results
              </div>
            )}
            {results && results.length > 0 && (
              <div>
                <div className={s.resultsnb}>
                  {results.length}
                  &nbsp;results
                </div>
                {results.map(r => (
                  <Link key={r.id} className={s.result} to={`/artist/${r.id}`} onClick={close}>
                    <img src={r?.images?.[0]?.url} alt="artist" />
                    {r.name}
                    {!mobile && <>&nbsp;-&nbsp;</>}
                    {!mobile && (
                      <div>
                        popularity&nbsp;
                        {r.popularity}
                        ,&nbsp;
                        {r.followers.total}
                        &nbsp;followers
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </div>
  );
}

export default SearchBar;
