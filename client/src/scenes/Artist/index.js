import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { CircularProgress, Grid, Typography } from '@material-ui/core';
import API from '../../services/API';
import s from './index.module.css';
import Rank from './components/Cards/Rank';
import SongsListened from './components/Cards/SongsListened';
import { getTextColorFromCSSBackgroundRGB } from '../../services/colors';
import BestPeriod from './components/Cards/BestPeriod';
import FirstLast from './components/Cards/FirstLast';
import MostListened from './components/Cards/MostListened';

function getAverageRGB(imgEl) {
  imgEl.crossOrigin = '';
  const blockSize = 5; // only visit every 5 pixels
  const defaultRGB = { r: 0, g: 0, b: 0 }; // for non-supporting envs
  const canvas = document.createElement('canvas');
  const context = canvas.getContext && canvas.getContext('2d');
  let data;
  const rgb = { r: 0, g: 0, b: 0 };
  let count = 0;

  if (!context) {
    return defaultRGB;
  }

  canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  const { height, width } = canvas;

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    return defaultRGB;
  }

  const { length } = data.data;

  for (let i = 0; i < length; i += blockSize * 4) {
    count += 1;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  // ~~ used to floor values
  rgb.r = Math.floor(rgb.r / count);
  rgb.g = Math.floor(rgb.g / count);
  rgb.b = Math.floor(rgb.b / count);

  return rgb;
}

function Artist() {
  const params = useParams();
  const [artistStats, setArtistStats] = useState(null);
  const [neededArtists, setNeededArtists] = useState({});
  const location = useLocation();

  useEffect(() => {
    setArtistStats(null);
  }, [location]);

  const [bg, setBg] = useState(null);
  const imgRef = useRef(null);
  const initBg = useCallback(() => {
    if (imgRef.current !== null) {
      setBg(getAverageRGB(imgRef.current));
    }
  }, []);

  useEffect(() => {
    async function get() {
      try {
        const res = await API.getArtistStats(params.artistId);
        setArtistStats(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    get();
  }, [params]);

  useEffect(() => {
    if (!artistStats) {
      return;
    }
    async function findMissing() {
      const artistIds = artistStats.rank.results.map(e => e.id);
      try {
        const missingPromises = artistIds.filter(e => !neededArtists[e]).map(e => API.getArtist(e));
        if (missingPromises.length === 0) return;
        const results = (await Promise.all(missingPromises)).map(e => e.data);
        const artists = { ...neededArtists };
        results.forEach(r => { artists[r.id] = r; });
        setNeededArtists(artists);
      } catch (e) {
        console.error(e);
      }
    }
    findMissing();
  }, [artistStats, neededArtists]);

  if (artistStats === null) return <CircularProgress />;
  if (!artistStats.total) {
    return (
      <div>
        You never listened to&nbsp;
        {artistStats.artist.name}
      </div>
    );
  }

  return (
    <div>
      <header className={s.header}>
        <img className={s.headerbg} src={artistStats.artist.images[0].url} alt="artist-blur" />
        <div className={s.headercontent}>
          <div className={s.img}>
            <div>
              <div>
                <img src={artistStats.artist.images[0].url} ref={imgRef} onLoad={initBg} alt="artist" />
              </div>
            </div>
          </div>
          <Typography
            align="left"
            variant="h4"
            style={{ color: bg ? getTextColorFromCSSBackgroundRGB(bg.r, bg.g, bg.b) : '' }}
          >
            {artistStats.artist.name}
          </Typography>
        </div>
      </header>
      <Grid container spacing={2} alignItems="stretch" className={s.grid}>
        <Grid item xs={12} md={6}><Rank rank={artistStats.rank} artists={neededArtists} /></Grid>
        <Grid item xs={12} md={6}><SongsListened total={artistStats.total} /></Grid>
        <Grid item xs={12} md={6}><MostListened mostListened={artistStats.mostListened} /></Grid>
        <Grid item xs={12} md={6}><FirstLast firstLast={artistStats.firstLast} /></Grid>
        <Grid item xs={12} md={6}><BestPeriod bestPeriod={artistStats.bestPeriod} /></Grid>
      </Grid>
    </div>
  );
}

export default Artist;
