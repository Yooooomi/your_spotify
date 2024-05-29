import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { ThemeProvider } from "@mui/system";
import { useSelector } from "react-redux";
import Layout from "./components/Layout";
import Message from "./components/Message";
import PrivateRoute from "./components/PrivateRoute";
import Wrapper from "./components/Wrapper";
import Login from "./scenes/Account/Login";
import AllStats from "./scenes/AllStats";
import ArtistStats from "./scenes/ArtistStats";
import Home from "./scenes/Home";
import Logout from "./scenes/Logout";
import Settings from "./scenes/Settings";
import Albums from "./scenes/Tops/Albums";
import Artists from "./scenes/Tops/Artists";
import Songs from "./scenes/Tops/Songs";
import CollaborativeSongs from "./scenes/Collaborative/Affinity/Songs";
import CollaborativeAlbums from "./scenes/Collaborative/Affinity/Albums";
import CollaborativeArtists from "./scenes/Collaborative/Affinity/Artists";
import "./App.css";
import RegistrationsDisabled from "./scenes/Error/RegistrationsDisabled";
import Affinity from "./scenes/Collaborative/Affinity";
import { useTheme } from "./services/theme";
import { selectDarkMode } from "./services/redux/modules/user/selector";
import PlaylistDialog from "./components/PlaylistDialog";
import TrackStats from "./scenes/TrackStats";
import LongestSessions from "./scenes/LongestSessions";
import AlbumStats from "./scenes/AlbumStats";
import Benchmarks from "./scenes/Benchmarks";
import ApiEndpointSetToFronted from "./scenes/Error/ApiEndpointSetToFronted";

function App() {
  const dark = useSelector(selectDarkMode);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useTheme();

  useEffect(() => {
    const vars =
      dark === "dark" || (dark === "follow" && prefersDarkMode)
        ? "dark-vars"
        : "light-vars";
    document.body.setAttribute("class", vars);
  }, [dark, prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <BrowserRouter>
          <Wrapper />
          <Message />
          <PlaylistDialog />
          <Layout>
            <Routes>
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <PrivateRoute>
                    <LongestSessions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/all"
                element={
                  <PrivateRoute>
                    <AllStats />
                  </PrivateRoute>
                }
              />
              <Route path="logout" element={<Logout />} />
              <Route path="login" element={<Login />} />
              <Route
                path="/registrations-disabled"
                element={<RegistrationsDisabled />}
              />
              <Route
                path="/oauth/spotify" // Error page when someone accidentally configures their API_ENDPOINT to point to the frontend instead of the backend
                element={<ApiEndpointSetToFronted />}
              />
              <Route
                path="/top/songs"
                element={
                  <PrivateRoute>
                    <Songs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/top/albums"
                element={
                  <PrivateRoute>
                    <Albums />
                  </PrivateRoute>
                }
              />
              <Route
                path="/top/artists"
                element={
                  <PrivateRoute>
                    <Artists />
                  </PrivateRoute>
                }
              />
              <Route
                path="/collaborative/affinity"
                element={
                  <PrivateRoute>
                    <Affinity />
                  </PrivateRoute>
                }
              />
              <Route
                path="/collaborative/top/songs/:mode"
                element={
                  <PrivateRoute>
                    <CollaborativeSongs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/collaborative/top/albums/:mode"
                element={
                  <PrivateRoute>
                    <CollaborativeAlbums />
                  </PrivateRoute>
                }
              />
              <Route
                path="/collaborative/top/artists/:mode"
                element={
                  <PrivateRoute>
                    <CollaborativeArtists />
                  </PrivateRoute>
                }
              />
              <Route
                path="/artist/:id"
                element={
                  <PrivateRoute>
                    <ArtistStats />
                  </PrivateRoute>
                }
              />
              <Route
                path="/album/:id"
                element={
                  <PrivateRoute>
                    <AlbumStats />
                  </PrivateRoute>
                }
              />
              <Route
                path="/song/:id"
                element={
                  <PrivateRoute>
                    <TrackStats />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings/*"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/benchmarks"
                element={
                  <PrivateRoute>
                    <Benchmarks />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
