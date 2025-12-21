import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import ManageCourse from './pages/ManageCourse';
import CoursePlayer from './pages/CoursePlayer'; // Ensure you have this file
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 👇 THIS IS THE MISSING ROUTE THAT CAUSED YOUR ERROR */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Mentor Routes */}
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/manage-course/:id" element={<ManageCourse />} />

        {/* Student Routes */}
        <Route path="/course/:id" element={<CoursePlayer />} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;