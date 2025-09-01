import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./utils/ProtectedRoute";

const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />

            {/* Authenticated area */}
            <Route element={<ProtectedRoute />}>

              {/* Wrap all authed routes in ProtectedRoute */}
              <Route path="/profile" element={<Profile />} />
              {/* other authed routes */}
            </Route>

            {/* Catch-all 404 (keep last) */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;
