import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster, ToasterProvider } from "@/components/ui/Toaster";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { DarkModeProvider } from "@/context/DarkModeContext";
import Home from "@/pages/Home";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Profile from "@/pages/Profile";
import PostJob from "@/pages/PostJob";
import JobDetails from "@/pages/JobDetails";
import SavedJobs from "@/pages/SavedJobs";
import AppliedJobs from "@/pages/AppliedJobs";
import ViewApplications from "@/pages/ViewApplications";
import Settings from "@/pages/Settings";
import { PrivateRoute } from "@/components/PrivateRoute";
import { useEffect, useState } from "react";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <AuthProvider>
        <DarkModeProvider>
          <ToasterProvider>
            <Routes>
              {/* Auth routes without Layout */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected routes with Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="post-job" element={<PrivateRoute><PostJob /></PrivateRoute>} />
                <Route path="jobs/:jobId" element={<JobDetails />} />
                <Route path="saved-jobs" element={<PrivateRoute><SavedJobs /></PrivateRoute>} />
                <Route path="applied-jobs" element={<PrivateRoute><AppliedJobs /></PrivateRoute>} />
                <Route path="my-job-applications" element={<PrivateRoute><ViewApplications /></PrivateRoute>} />
                <Route path="settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="*" element={<Home />} />
              </Route>
            </Routes>
            <Toaster />
          </ToasterProvider>
        </DarkModeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
