import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, PlayCircle, PlusCircle, Settings } from 'lucide-react'; // Added icons
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const endpoint = user?.role === 'mentor' ? '/courses/my' : '/courses/assigned';
        const res = await api.get(endpoint);
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCourses();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">LMS Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 capitalize">Role: <strong>{user?.role}</strong></span>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-500 hover:text-red-500">
                <LogOut size={20} />
            </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-4">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          
          {/* Mentor "Create Course" Button */}
          {user?.role === 'mentor' && (
            <button 
              onClick={() => navigate('/create-course')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <PlusCircle size={18} /> New Course
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
             <p className="text-gray-500 mb-2">No courses found.</p>
             {user?.role === 'student' && <p className="text-sm text-gray-400">Ask your mentor to assign you a course.</p>}
             {user?.role === 'mentor' && <p className="text-sm text-gray-400">Click "New Course" to get started.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* The MAP starts here, defining 'course' */}
            {courses.map((course) => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description || "No description provided."}
                </p>
                
                {/* The Button logic uses 'course' here, inside the map */}
                <button 
                  onClick={() => navigate(user?.role === 'mentor' ? `/manage/${course.id}` : `/course/${course.id}`)}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded font-medium
                    ${user?.role === 'mentor' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}
                  `}
                >
                  {user?.role === 'mentor' ? <Settings size={18} /> : <PlayCircle size={18} />}
                  {user?.role === 'mentor' ? 'Manage Content' : 'Start Learning'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}