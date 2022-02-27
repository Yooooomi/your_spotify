import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Message from './components/Message';
import PrivateRoute from './components/PrivateRoute';
import Wrapper from './components/Wrapper';
import Login from './scenes/Account/Login';
import AllStats from './scenes/AllStats';
import ArtistStats from './scenes/ArtistStats';
import Home from './scenes/Home';
import Logout from './scenes/Logout';
import Settings from './scenes/Settings';
import Albums from './scenes/Tops/Albums';
import Artists from './scenes/Tops/Artists';
import Songs from './scenes/Tops/Songs';

import './App.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import RegistrationsDisabled from './scenes/RegistrationsDisabled';

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
                <PrivateRoute>
                  <Home />
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
            <Route path="/registrations-disabled" element={<RegistrationsDisabled />} />
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
              path="/artist/:id"
              element={
                <PrivateRoute>
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
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;
