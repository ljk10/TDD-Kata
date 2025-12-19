import { ReactNode } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CoursePlayer from './pages/CoursePlayer';
import AdminDashboard from './pages/AdminDashboard';
import CreateCourse from './pages/CreateCourse';
import ManageCourse from './pages/ManageCourse';

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children: ReactNode, roles?: string[] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>; 
};

// Helper to switch dashboard based on role
const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes> {/* <--- ALL ROUTES MUST BE INSIDE THIS TAG */}
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main Dashboard (Protected) */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/course/:courseId" element={
            <ProtectedRoute roles={['student', 'mentor']}> {/* Mentors can view too */}
              <CoursePlayer />
            </ProtectedRoute>
          } />

          {/* Mentor Routes */}
          <Route path="/create-course" element={
            <ProtectedRoute roles={['mentor']}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          
          <Route path="/manage/:courseId" element={
            <ProtectedRoute roles={['mentor']}>
              <ManageCourse />
            </ProtectedRoute>
          } />

        </Routes> {/* <--- CLOSING TAG WAS LIKELY MISPLACED */}
      </Router>
    </AuthProvider>
  );
}

export default App;