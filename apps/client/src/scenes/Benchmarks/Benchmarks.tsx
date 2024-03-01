import { useSelector } from "react-redux";
import {
  Button,
  IconButton,
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { useState } from "react";
import Header from "../../components/Header";
import {
  selectRawIntervalDetail,
  selectUser,
} from "../../services/redux/modules/user/selector";
import { api } from "../../services/apis/api";
import { Timesplit } from "../../services/types";
import TitleCard from "../../components/TitleCard";
import Text from "../../components/Text";

type Request = {
  title: string;
  request: (startTimer: () => void) => Promise<any>;
};

const NOT_FINISHED_REQUEST = -1;
const FAILED_REQUEST = -2;

export default function Benchmarks() {
  const { interval } = useSelector(selectRawIntervalDetail);

  const [elapsedTime, setElapsedTime] = useState<Record<string, number>>({});

  const user = useSelector(selectUser);

  if (!user) {
    return null;
  }

  const NB = 30;
  const OFFSET = 0;

  const requests: Request[] = [
    {
      title: "Get tracks",
      request: startTimer => {
        startTimer();
        return api.getTracks(interval.start, interval.end, 20, OFFSET);
      },
    },
    {
      title: "Get most listened",
      request: startTimer => {
        startTimer();
        return api.mostListened(interval.start, interval.end, Timesplit.all);
      },
    },
    {
      title: "Get most listened artists",
      request: startTimer => {
        startTimer();
        return api.mostListenedArtist(
          interval.start,
          interval.end,
          Timesplit.all,
        );
      },
    },
    {
      title: "Get songs per",
      request: startTimer => {
        startTimer();
        return api.songsPer(interval.start, interval.end, Timesplit.all);
      },
    },
    {
      title: "Get time per",
      request: startTimer => {
        startTimer();
        return api.timePer(interval.start, interval.end, Timesplit.all);
      },
    },
    {
      title: "Get feat ratio",
      request: startTimer => {
        startTimer();
        return api.featRatio(interval.start, interval.end, Timesplit.all);
      },
    },
    {
      title: "Get album date ratio",
      request: startTimer => {
        startTimer();
        return api.albumDateRatio(interval.start, interval.end, Timesplit.all);
      },
    },
    {
      title: "Get popularity per",
      request: startTimer => {
        startTimer();
        return api.popularityPer(interval.start, interval.end, Timesplit.all);
      },
    },
    {
      title: "Get different artists per",
      request: startTimer => {
        startTimer();
        return api.differentArtistsPer(
          interval.start,
          interval.end,
          Timesplit.all,
        );
      },
    },
    {
      title: "Get time per hour of day",
      request: startTimer => {
        startTimer();
        return api.timePerHourOfDay(interval.start, interval.end);
      },
    },
    {
      title: "Get best songs",
      request: startTimer => {
        startTimer();
        return api.getBestSongs(interval.start, interval.end, NB, OFFSET);
      },
    },
    {
      title: "Get best artists",
      request: startTimer => {
        startTimer();
        return api.getBestArtists(interval.start, interval.end, NB, OFFSET);
      },
    },
    {
      title: "Get best albums",
      request: startTimer => {
        startTimer();
        return api.getBestAlbums(interval.start, interval.end, NB, OFFSET);
      },
    },
    {
      title: "Get best songs of hour",
      request: startTimer => {
        startTimer();
        return api.getBestSongsOfHour(interval.start, interval.end);
      },
    },
    {
      title: "Get best albums of hour",
      request: startTimer => {
        startTimer();
        return api.getBestAlbumsOfHour(interval.start, interval.end);
      },
    },
    {
      title: "Get best artists of hour",
      request: startTimer => {
        startTimer();
        return api.getBestArtistsOfHour(interval.start, interval.end);
      },
    },
    {
      title: "Get longest sessions",
      request: startTimer => {
        startTimer();
        return api.getLongestSessions(interval.start, interval.end);
      },
    },
    {
      title: "Get artist page",
      request: async startTimer => {
        const { data: bestArtists } = await api.getBestArtists(
          interval.start,
          interval.end,
          1,
          0,
        );
        const [bestArtist] = bestArtists;
        if (!bestArtist) {
          return;
        }
        startTimer();
        return api.getArtistStats(bestArtist.artist.id);
      },
    },
    {
      title: "Get album page",
      request: async startTimer => {
        const { data: bestAlbums } = await api.getBestAlbums(
          interval.start,
          interval.end,
          1,
          0,
        );
        const [bestAlbum] = bestAlbums;
        if (!bestAlbum) {
          return;
        }
        startTimer();
        return api.getAlbumStats(bestAlbum.album.id);
      },
    },
    {
      title: "Get track page",
      request: async startTimer => {
        const { data: bestTracks } = await api.getBestSongs(
          interval.start,
          interval.end,
          1,
          0,
        );
        const [bestTrack] = bestTracks;
        if (!bestTrack) {
          return;
        }
        startTimer();
        return api.getTrackStats(bestTrack.track.id);
      },
    },
  ];

  const run = async (req: Request) => {
    setElapsedTime(prev => ({ ...prev, [req.title]: -1 }));
    let start = -1;
    const { data: result } = await req.request(() => {
      start = Date.now();
    });
    console.log("Result", result);
    if (start === -1) {
      setElapsedTime(prev => ({ ...prev, [req.title]: FAILED_REQUEST }));
      return;
    }
    const end = Date.now();
    setElapsedTime(prev => ({ ...prev, [req.title]: end - start }));
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
        right={
          <Button variant="contained" onClick={runAll}>
            Run All
          </Button>
        }>
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
            const requestTimeElapsed = elapsedTime[req.title];
            if (requestTimeElapsed === NOT_FINISHED_REQUEST) {
              elapsed = <i>Loading...</i>;
            } else if (requestTimeElapsed === FAILED_REQUEST) {
              elapsed = <i>Failed</i>;
            } else if (requestTimeElapsed) {
              elapsed = `${requestTimeElapsed}ms`;
            }

            return (
              <TableRow key={req.title}>
                <TableCell component="th" scope="row">
                  <Text>{req.title}</Text>
                </TableCell>
                <TableCell align="right">
                  <Text>{elapsed}</Text>
                </TableCell>
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
