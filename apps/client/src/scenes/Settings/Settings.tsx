import { CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import ButtonsHeader from "../../components/ButtonsHeader";
import FullscreenCentered from "../../components/FullscreenCentered";
import Header from "../../components/Header";
import Masonry from "../../components/Masonry";
import Text from "../../components/Text";
import { api } from "../../services/apis/api";
import { useAPI } from "../../services/hooks/hooks";
import { selectSettings } from "../../services/redux/modules/settings/selector";
import {
  selectIsPublic,
  selectUser,
} from "../../services/redux/modules/user/selector";
import { compact, conditionalEntry } from "../../services/tools";
import AccountInfos from "./AccountInfos";
import AllowRegistration from "./AllowRegistration";
import BlacklistArtist from "./BlacklistArtist";
import DarkMode from "./DarkMode";
import DeleteUser from "./DeleteUser";
import Importer from "./Importer";
import s from "./index.module.css";
import PublicToken from "./PublicToken";
import RelogToSpotify from "./RelogToSpotify";
import SetAdmin from "./SetAdmin";
import SpotifyAccountInfos from "./SpotifyAccountInfos";
import Timezone from "./Timezone";
import DateFormat from "./DateFormat";
import { StatMeasurement } from "./StatMeasurement";

export default function Settings() {
  const settings = useSelector(selectSettings);
  const sme = useAPI(api.sme);
  const user = useSelector(selectUser);
  const isPublic = useSelector(selectIsPublic);

  if (!settings) {
    return (
      <FullscreenCentered>
        <CircularProgress />
        <Text element="h3">Your settings are loading</Text>
      </FullscreenCentered>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = compact([
    { url: "/settings/account", label: "Account" },
    conditionalEntry(
      { url: "/settings/statistics", label: "Statistics" },
      !isPublic,
    ),
    conditionalEntry(
      { url: "/settings/admin", label: "Admin" },
      user.admin && !isPublic,
    ),
  ]);

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Here are the settings for Your Spotify, anyone with an account can access this page"
        hideInterval
      />
      <ButtonsHeader items={tabs} />
      <div className={s.content}>
        <Routes>
          <Route
            path="/account"
            element={
              <Masonry>
                {!isPublic && (
                  <AccountInfos
                    user={user}
                    settings={settings}
                    isPublic={isPublic}
                  />
                )}
                {sme && !isPublic && (
                  <SpotifyAccountInfos spotifyAccount={sme} />
                )}
                <DarkMode />
                {!isPublic && <RelogToSpotify />}
                {!isPublic && <Importer />}
                {!isPublic && <PublicToken />}
              </Masonry>
            }
          />
          <Route
            path="/admin"
            element={
              <Masonry>
                {user.admin && !isPublic && <SetAdmin />}
                {user.admin && !isPublic && <DeleteUser />}
                {user.admin && !isPublic && (
                  <AllowRegistration settings={settings} />
                )}
              </Masonry>
            }
          />
          <Route
            path="/statistics"
            element={
              <Masonry>
                {!isPublic && <BlacklistArtist />}
                {!isPublic && <Timezone />}
                {!isPublic && <DateFormat />}
                {!isPublic && <StatMeasurement />}
              </Masonry>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
