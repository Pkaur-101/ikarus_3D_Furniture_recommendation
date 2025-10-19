import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Recommend from "./pages/Recommend";
import Analytics from "./pages/Analytics";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Recommend />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
};

export default App;
