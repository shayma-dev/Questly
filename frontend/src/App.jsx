// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Profile from "./pages/Profile";
import TasksPage from "./pages/TasksPage";
import NotFound from "./pages/NotFound";
import StudyPlannerPage from "./pages/StudyPlannerPage";
import NoteKeeperPage from "./pages/NoteKeeperPage";
import FocusPage from "./pages/FocusPage";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProtectedRoute from "./utils/ProtectedRoute";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import WithPageLoader from "./components/motion/WithPageLoader";
import AppNav from "./components/common/AppNav";

// src/App.jsx (AnimatedRoutes)
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      {<AppNav />}
      <WithPageLoader
        routeKey={location.pathname}
        className="min-h-[calc(100vh-64px)]"
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route element={<ProtectedRoute />}>
            {/* Student routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/study" element={<StudyPlannerPage />} />
            <Route path="/notekeeper" element={<NoteKeeperPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </WithPageLoader>
    </>
  );
}
export default function App() {
  return (
    <>
      <Tooltip.Provider delayDuration={250}>
        <AuthProvider>
          <Router>
            <AnimatedRoutes />
          </Router>
        </AuthProvider>
      </Tooltip.Provider>
      <Toaster richColors position="top-right" closeButton />
    </>
  );
}
