import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateCourse from './pages/CreateCourse';
import ManageCourse from './pages/ManageCourse';
import CoursePlayer from './pages/CoursePlayer'; 
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        
        <Route path="/" element={<Navigate to="/login" />} />

        
        <Route path="/dashboard" element={<Dashboard />} />

        
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/manage-course/:id" element={<ManageCourse />} />

        
        <Route path="/course/:id" element={<CoursePlayer />} />

      
       <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;