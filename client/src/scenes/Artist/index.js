import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Typography } from '@material-ui/core';
import API from '../../services/API';
import s from './index.module.css';

function Artist(props) {
  const params = useParams();
  const [artistStats, setArtistStats] = useState(null);

  useEffect(() => {
    console.log(params.artistId);
    async function get() {
      try {
        const res = await API.getArtist(params.artistId);
        setArtistStats(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    get();
  }, [params]);

  if (artistStats === null) return <CircularProgress />;

  return (
    <div className={s.root}>
      <Typography align="left" variant="h4">
        {artistStats.artist.name}
      </Typography>
    </div>
  );
}

export default Artist;
