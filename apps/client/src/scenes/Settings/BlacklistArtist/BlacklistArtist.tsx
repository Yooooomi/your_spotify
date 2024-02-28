import { CircularProgress, IconButton } from "@mui/material";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import UnblacklistIcon from "@mui/icons-material/CloseRounded";
import ResourceSearch from "../../../components/SiderSearch";
import Text from "../../../components/Text";
import { useLoadArtists } from "../../../services/hooks/artist";
import { selectBlacklistedArtists } from "../../../services/redux/modules/user/selector";
import { compact } from "../../../services/tools";
import { Artist } from "../../../services/types";
import BlacklistArtistDialog from "../../../components/BlacklistArtistDialog";
import InlineArtist from "../../../components/InlineArtist";
import TitleCard from "../../../components/TitleCard";
import IdealImage from "../../../components/IdealImage";
import s from "./index.module.css";

export default function BlacklistArtist() {
  const [askedBlacklist, setAskedBlacklist] = useState<Artist | undefined>();
  const [askedUnblacklist, setAskedUnblacklist] = useState<
    Artist | undefined
  >();
  const blacklisted = useSelector(selectBlacklistedArtists);
  const { artists, loaded } = useLoadArtists(blacklisted);

  const askBlacklist = useCallback((artist: Artist) => {
    setAskedBlacklist(artist);
  }, []);

  const askUnblacklist = useCallback((artist: Artist) => {
    setAskedUnblacklist(artist);
  }, []);

  if (!loaded) {
    return <CircularProgress />;
  }

  const askedArtist = askedBlacklist ?? askedUnblacklist;

  return (
    <TitleCard title="Blacklisted artists">
      <Text element="span" className={s.marginbottom}>
        Blacklist artists so they never appear in the statistics. Blacklisting
        an artist will remove already existing records and never record them
        again.
      </Text>
      <div className={s.root}>
        <ResourceSearch
          onArtistClick={askBlacklist}
          inputClassname={s.search}
        />
        {blacklisted.length === 0 && (
          <Text className={s.none}>You have not blacklisted any artist</Text>
        )}
        {compact(blacklisted.map(b => artists[b])).map(artist => (
          <div key={artist.id} className={s.artist}>
            <IdealImage
              className={s.artistcover}
              images={artist.images}
              size={48}
              width={48}
              height={48}
              alt="artist"
            />
            <InlineArtist artist={artist} />
            <IconButton
              className={s.unblacklist}
              onClick={() => askUnblacklist(artist)}>
              <UnblacklistIcon />
            </IconButton>
          </div>
        ))}
        <BlacklistArtistDialog
          artistId={askedArtist?.id}
          artistName={askedArtist?.name}
          blacklisted={Boolean(askedUnblacklist)}
          onClose={() => {
            setAskedBlacklist(undefined);
            setAskedUnblacklist(undefined);
          }}
        />
      </div>
    </TitleCard>
  );
}
