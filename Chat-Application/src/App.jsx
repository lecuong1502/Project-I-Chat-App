import { useState } from 'react'
import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Welcome from './pages/Welcome';
import Signup from './pages/Signup';
import MainBoard from './pages/Mainboard'
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/main-board"
          element={
            <ProtectedRoute>
              <MainBoard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
