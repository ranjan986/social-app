import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Subscription from './pages/Subscription';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Community from './pages/Community';
import Questions from './pages/Questions';
import Leaderboard from './pages/Leaderboard';
import UserProfile from './pages/UserProfile';
import Reels from './pages/Reels';
import Notifications from './pages/Notifications';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />

            <Route path="/reels" element={
              <PrivateRoute>
                <Reels />
              </PrivateRoute>
            } />

            <Route path="/community" element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            } />

            <Route path="/questions" element={
              <PrivateRoute>
                <Questions />
              </PrivateRoute>
            } />

            <Route path="/leaderboard" element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            } />

            <Route path="/subscription" element={
              <PrivateRoute>
                <Subscription />
              </PrivateRoute>
            } />

            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/user/:id" element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            } />

            <Route path="/notifications" element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
