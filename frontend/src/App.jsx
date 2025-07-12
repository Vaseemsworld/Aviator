import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import { SoundProvider } from "./context/SoundContext.jsx";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import EnginProvider from "./context/EnginContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./components/Loader.jsx";

const AppContent = () => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <Loader />;
  }
  if (user) {
    return (
      <SoundProvider>
        <EnginProvider initialBalance={user?.balance || 0}>
          <Dashboard />
        </EnginProvider>
      </SoundProvider>
    );
  } else {
    return <Home />;
  }
};

const App = () => {
  return (
    <EnginProvider>
      <AuthProvider>
        <AppContent />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </EnginProvider>
  );
};

export default App;
