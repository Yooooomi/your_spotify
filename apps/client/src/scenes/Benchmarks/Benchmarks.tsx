import { useSelector } from "react-redux";
import {
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { HourglassTop, PlayArrow } from "@mui/icons-material";
import { useState } from "react";
import Header from "../../components/Header";
import {
  selectRawIntervalDetail,
  selectUser,
} from "../../services/redux/modules/user/selector";
import { api } from "../../services/apis/api";
import { Timesplit } from "../../services/types";
import TitleCard from "../../components/TitleCard";

type Request = {
  id: string;
  title: string;
  request: () => Promise<any>;
};

export default function Benchmarks() {
  const { interval } = useSelector(selectRawIntervalDetail);

  const [elapsedTime, setElapsedTime] = useState<Record<string, number>>({});

  const user = useSelector(selectUser);

  if (!user) {
    return null;
  }

  const requests: Request[] = [
    {
      id: "getTracks",
      title: "Get tracks",
      request: () => api.getTracks(interval.start, interval.end, 20, 1),
    },
    {
      id: "getMostListened",
      title: "Get most listened",
      request: () =>
        api.mostListened(interval.start, interval.end, Timesplit.all),
    },
    {
      id: "getMostListenedArtists",
      title: "Get most listened artists",
      request: () =>
        api.mostListenedArtist(interval.start, interval.end, Timesplit.all),
    },
    {
      id: "getSongsPer",
      title: "Get songs per",
      request: () => api.songsPer(interval.start, interval.end, Timesplit.all),
    },
    {
      id: "getTimePer",
      title: "Get time per",
      request: () => api.timePer(interval.start, interval.end, Timesplit.all),
    },
    {
      id: "getFeatRatio",
      title: "Get feat ratio",
      request: () => api.featRatio(interval.start, interval.end, Timesplit.all),
    },
    {
      id: "getAlbumDateRatio",
      title: "Get album date ratio",
      request: () =>
        api.albumDateRatio(interval.start, interval.end, Timesplit.all),
    },
    {
      id: "getPopularityPer",
      title: "Get popularity per",
      request: () =>
        api.popularityPer(interval.start, interval.end, Timesplit.all),
    },
    {
      id: "getDifferentArtistsPer",
      title: "Get different artists per",
      request: () =>
        api.differentArtistsPer(interval.start, interval.end, Timesplit.all),
    },
    {
      id: "getTimePerHourOfDay",
      title: "Get time per hour of day",
      request: () => api.timePerHourOfDay(interval.start, interval.end),
    },
    {
      id: "getBestSongs",
      title: "Get best songs",
      request: () => api.getBestSongs(interval.start, interval.end, 30, 1),
    },
    {
      id: "getBestArtists",
      title: "Get best artists",
      request: () => api.getBestArtists(interval.start, interval.end, 30, 1),
    },
    {
      id: "getBestAlbums",
      title: "Get best albums",
      request: () => api.getBestAlbums(interval.start, interval.end, 30, 1),
    },
    {
      id: "getBestSongsOfHour",
      title: "Get best songs of hour",
      request: () => api.getBestSongsOfHour(interval.start, interval.end),
    },
    {
      id: "getBestAlbumsOfHour",
      title: "Get best albums of hour",
      request: () => api.getBestAlbumsOfHour(interval.start, interval.end),
    },
    {
      id: "getBestArtistsOfHour",
      title: "Get best artists of hour",
      request: () => api.getBestArtistsOfHour(interval.start, interval.end),
    },
    {
      id: "getLongestSessions",
      title: "Get longest sessions",
      request: () => api.getLongestSessions(interval.start, interval.end),
    },
  ];

  const run = async (req: Request) => {
    setElapsedTime(prev => ({ ...prev, [req.id]: -1 }));
    const start = Date.now();
    await req.request();
    const end = Date.now();
    setElapsedTime(prev => ({ ...prev, [req.id]: end - start }));
  };

  const runAll = async () => {
    // We need to run the requests in sequence to get a more
    // accurate measure of the time it takes to run each request separately.
    for (const req of requests) {
      await run(req);
    }
  };

  return (
    <div>
      <Header title="Benchmarks" subtitle="Analyze server queries time" />
      <TitleCard
        title="Benchmarks"
        right={<Button onClick={runAll}>Run All</Button>}>
        <Table>
          <TableHead>
            <TableCell>Request</TableCell>
            <TableCell align="right">Elapsed time</TableCell>
            <TableCell
              padding="none"
              align="right"
              style={{ paddingRight: 24 }}>
              Actions
            </TableCell>
          </TableHead>
          {requests.map(req => {
            let elapsed;
            if (elapsedTime[req.id] === -1) {
              elapsed = <i>Loading...</i>;
            } else if (elapsedTime[req.id]) {
              elapsed = `${elapsedTime[req.id]}ms`;
            }

            return (
              <TableRow>
                <TableCell component="th" scope="row">
                  {req.title}
                </TableCell>
                <TableCell align="right">{elapsed}</TableCell>
                <TableCell
                  padding="none"
                  align="right"
                  style={{ paddingRight: 12 }}>
                  <IconButton color="success" onClick={() => run(req)}>
                    <PlayArrow />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>
      </TitleCard>
    </div>
  );
}
