import { Popper, Paper } from '@mui/material';
import clsx from 'clsx';
import { useRef, useState, useCallback } from 'react';
import { api } from '../../services/apis/api';
import { useConditionalAPI } from '../../services/hooks/hooks';
import { getAtLeastImage } from '../../services/tools';
import { Artist } from '../../services/types';
import Text from '../Text';
import s from './index.module.css';

interface ArtistSearchProps {
  onResultClick: (artist: Artist) => void;
  inputClassname?: string;
}

export default function ArtistSearch({
  onResultClick,
  inputClassname,
}: ArtistSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState('');
  const results = useConditionalAPI(
    search.length >= 3,
    api.searchArtists,
    search,
  );

  const internOnResultClick = useCallback(
    (artist: Artist) => {
      setSearch('');
      onResultClick(artist);
    },
    [onResultClick],
  );

  return (
    <>
      <input
        className={clsx(s.input, inputClassname)}
        placeholder="Search..."
        value={search}
        onChange={ev => setSearch(ev.target.value)}
        ref={inputRef}
      />
      <Popper
        open={search.length > 0}
        anchorEl={inputRef.current}
        placement="bottom"
        className={s.popper}>
        <Paper
          className={s.results}
          style={{ width: inputRef.current?.clientWidth }}>
          {search.length < 3 && (
            <Text element="strong">At least 3 characters</Text>
          )}
          {results?.length === 0 && (
            <Text element="strong">No results found</Text>
          )}
          {results?.map(res => (
            <button
              type="button"
              key={res.id}
              className={clsx('no-button', s.result)}
              onClick={() => internOnResultClick(res)}>
              <img
                className={s.resultimage}
                src={getAtLeastImage(res.images, 48)}
                alt="Artist"
              />
              <Text element="strong">{res.name}</Text>
            </button>
          ))}
        </Paper>
      </Popper>
    </>
  );
}
