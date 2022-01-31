import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Message from "./components/Message";
import PrivateRoute from "./components/PrivateRoute";
import Wrapper from "./components/Wrapper";
import Login from "./scenes/Account/Login";
import Register from "./scenes/Account/Register";
import AllStats from "./scenes/AllStats";
import ArtistStats from "./scenes/ArtistStats";
import Home from "./scenes/Home";
import Logout from "./scenes/Logout";
import LogToSpotify from "./scenes/LogToSpotify";
import Settings from "./scenes/Settings";
import Albums from "./scenes/Tops/Albums";
import Artists from "./scenes/Tops/Artists";
import Songs from "./scenes/Tops/Songs";

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Wrapper />
        <Message />
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute needSpotify>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/all"
              element={
                <PrivateRoute needSpotify>
                  <AllStats />
                </PrivateRoute>
              }
            />
            <Route path="logout" element={<Logout />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="/top/songs"
              element={
                <PrivateRoute needSpotify>
                  <Songs />
                </PrivateRoute>
              }
            />
            <Route
              path="/top/albums"
              element={
                <PrivateRoute needSpotify>
                  <Albums />
                </PrivateRoute>
              }
            />
            <Route
              path="/top/artists"
              element={
                <PrivateRoute needSpotify>
                  <Artists />
                </PrivateRoute>
              }
            />
            <Route
              path="/artist/:id"
              element={
                <PrivateRoute needSpotify>
                  <ArtistStats />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/login-spotify"
              element={
                <PrivateRoute>
                  <LogToSpotify />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
