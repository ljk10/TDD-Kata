import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Edit, PlayCircle, PlusCircle } from 'lucide-react'; // Ensure you have lucide-react installed

interface Course {
  id: string;
  title: string;
  description: string;
  mentor_id?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [role, setRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      
      const storedRole = localStorage.getItem('role') || 'student'; 
      setRole(storedRole);

      
      const res = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      
      setCourses(prev => prev.filter(c => c.id !== courseId));
      alert("Course deleted successfully!");
    } catch (err) {
      alert("Failed to delete course.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {role === 'mentor' ? 'Instructor Dashboard' : 'My Learning'}
          </h1>
          <p className="text-gray-500">Welcome back!</p>
        </div>

        
        {role === 'mentor' && (
          <button 
            onClick={() => navigate('/create-course')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <PlusCircle size={20} /> Create New Course
          </button>
        )}
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{course.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {course.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                
                
                {role === 'student' && (
                  <button 
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded hover:bg-green-100 font-semibold"
                  >
                    <PlayCircle size={18} /> Continue Learning
                  </button>
                )}

                
                {role === 'mentor' && (
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => navigate(`/manage-course/${course.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2 rounded hover:bg-blue-100 font-semibold text-sm"
                    >
                      <Edit size={16} /> Manage
                    </button>
                    
                    
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="flex items-center justify-center px-3 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      title="Delete Course"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400 bg-white rounded-lg border border-dashed">
            {role === 'mentor' 
              ? "You haven't created any courses yet." 
              : "You are not enrolled in any courses yet."}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;