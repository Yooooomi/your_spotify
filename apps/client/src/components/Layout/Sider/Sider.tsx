import { useCallback, useContext } from "react";
import clsx from "clsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SystemUpdateAlt as UpdateIcon } from "@mui/icons-material";

import { Tooltip } from "@mui/material";
import { useShareLink } from "../../../services/hooks/hooks";
import { alertMessage } from "../../../services/redux/modules/message/reducer";
import { selectUser } from "../../../services/redux/modules/user/selector";
import { useAppDispatch } from "../../../services/redux/tools";
import { LayoutContext } from "../LayoutContext";
import SiderSearch from "../../SiderSearch";
import { Album, Artist, TrackWithFullAlbum } from "../../../services/types";
import {
  selectUpdateAvailable,
  selectVersion,
} from "../../../services/redux/modules/settings/selector";
import Text from "../../Text";
import SiderCategory from "./SiderCategory/SiderCategory";
import { links } from "./types";
import SiderTitle from "./SiderTitle";
import s from "./index.module.css";

interface SiderProps {
  className?: string;
  isDrawer?: boolean;
}

export default function Sider({ className, isDrawer }: SiderProps) {
  const dispatch = useAppDispatch();
  const layoutContext = useContext(LayoutContext);
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();

  const goToArtist = useCallback(
    (artist: Artist) => {
      navigate(`/artist/${artist.id}`);
      layoutContext.closeDrawer();
    },
    [layoutContext, navigate],
  );

  const goToTrack = useCallback(
    (track: TrackWithFullAlbum) => {
      navigate(`/song/${track.id}`);
      layoutContext.closeDrawer();
    },
    [layoutContext, navigate],
  );

  const goToAlbum = useCallback(
    (album: Album) => {
      navigate(`/album/${album.id}`);
      layoutContext.closeDrawer();
    },
    [layoutContext, navigate],
  );

  const copyCurrentPage = useCallback(() => {
    if (!user?.publicToken) {
      dispatch(
        alertMessage({
          level: "error",
          message:
            "No public token generated, go to the settings page to generate one",
        }),
      );
      return;
    }
    dispatch(
      alertMessage({
        level: "info",
        message: "Copied current page to clipboard with public token",
      }),
    );
  }, [dispatch, user?.publicToken]);

  const toCopy = useShareLink();

  const version = useSelector(selectVersion);
  const updateAvailable = useSelector(selectUpdateAvailable);

  if (!user) {
    return null;
  }

  return (
    <div className={clsx(s.root, className, { [s.drawer]: isDrawer })}>
      <div className={s.title}>
        <SiderTitle />
      </div>
      <SiderSearch
        onTrackClick={goToTrack}
        onAlbumClick={goToAlbum}
        onArtistClick={goToArtist}
      />
      <nav>
        {links.map(category => (
          <SiderCategory
            key={category.label}
            user={user}
            pathname={location.pathname}
            onCopy={copyCurrentPage}
            toCopy={toCopy ?? ""}
            category={category}
          />
        ))}
      </nav>
      <div className={s.versionwrapper}>
        {version && (
          <Text noStyle className={s.version}>
            v{version}
          </Text>
        )}
        {updateAvailable && (
          <Tooltip title="An update is available">
            <a
              href="https://github.com/Yooooomi/your_spotify/releases"
              target="_blank"
              rel="noreferrer">
              <Text onDark>
                <UpdateIcon fontSize="small" color="info" />
              </Text>
            </a>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
