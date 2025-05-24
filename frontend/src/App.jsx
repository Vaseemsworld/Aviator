import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import { SoundProvider } from "./context/SoundContext.jsx";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import EnginProvider from "./context/EnginContext.jsx";

const App = () => {
  return (
    <>
      {/* <Home /> */}
      <SoundProvider>
        <EnginProvider>
          <Dashboard />
        </EnginProvider>
      </SoundProvider>
    </>
  );
};

export default App;
