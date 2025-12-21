import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ManageCourse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Content State
  const [chapterTitle, setChapterTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sequence, setSequence] = useState(1);
  
  // Enrollment State
  const [studentEmail, setStudentEmail] = useState(''); // 👈 Changed to Email
  
  const [message, setMessage] = useState('');
  const [courseTitle, setCourseTitle] = useState('');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setCourseTitle(res.data.title);
      } catch (err) {
        console.error("Failed to load details");
      }
    };
    fetchCourseDetails();
  }, [id]);

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/courses/${id}/chapters`, 
        { title: chapterTitle, video_url: videoUrl, sequence_order: sequence }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Chapter added successfully!');
      setChapterTitle('');
      setVideoUrl('');
      setSequence(prev => prev + 1);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to add chapter'}`);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // 👇 Sending 'email' instead of 'studentId'
      await axios.post(`http://localhost:5000/api/courses/${id}/enroll`, 
        { email: studentEmail }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`✅ Successfully enrolled ${studentEmail}!`);
      setStudentEmail('');
    } catch (err: any) {
      setMessage(`❌ Error: ${err.response?.data?.message || 'Failed to enroll student'}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <button onClick={() => navigate('/dashboard')} className="mb-4 text-indigo-600 font-semibold hover:underline">
        ← Back to Dashboard
      </button>

      <div className="bg-white shadow-xl rounded-lg p-8 border-t-4 border-indigo-600">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">{courseTitle}</h1>
        <p className="text-gray-500 text-sm mb-6 font-mono">ID: {id}</p>

        {message && (
          <div className={`p-4 mb-6 rounded text-center font-bold ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* LEFT: ADD CONTENT */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700">📺 Add Video Chapter</h2>
            <form onSubmit={handleAddChapter} className="space-y-4">
              <input 
                type="text" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500" placeholder="Chapter Title" required
              />
              <input 
                type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500" placeholder="Video URL (YouTube/MP4)" required
              />
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-500">Seq #</label>
                <input 
                  type="number" value={sequence} onChange={e => setSequence(parseInt(e.target.value))}
                  className="w-20 p-3 border rounded focus:ring-2 focus:ring-indigo-500" required
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 font-bold shadow">
                Add Chapter
              </button>
            </form>
          </div>

          {/* RIGHT: ENROLL STUDENTS */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700">🎓 Enroll Student</h2>
            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Student Email Address</label>
                {/* 👇 Input type is now email */}
                <input 
                  type="email" 
                  value={studentEmail} 
                  onChange={e => setStudentEmail(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500" 
                  placeholder="student@example.com" 
                  required
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-bold shadow">
                Assign to Course
              </button>
              <p className="text-xs text-gray-500 mt-2">
                * The student must already have an account registered with this email.
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManageCourse;