import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { UserPlus, Video } from 'lucide-react';

export default function ManageCourse() {
  const { courseId } = useParams();
  
  // Form 1: Add Chapter
  const { 
    register: registerChapter, 
    handleSubmit: submitChapter, 
    reset: resetChapter 
  } = useForm();

  // Form 2: Enroll Student
  const { 
    register: registerEnroll, 
    handleSubmit: submitEnroll, 
    reset: resetEnroll 
  } = useForm();

  // --- Handlers ---

  const onAddChapter = async (data: any) => {
    try {
      await api.post(`/courses/${courseId}/chapters`, {
        ...data,
        sequence_order: Number(data.sequence_order)
      });
      alert('Chapter Added!');
      resetChapter();
    } catch (err) {
      alert('Failed to add chapter');
    }
  };

  const onEnrollStudent = async (data: any) => {
    try {
      await api.post(`/courses/${courseId}/enroll`, { email: data.email });
      alert(`Success! ${data.email} can now access this course.`);
      resetEnroll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Enrollment failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Manage Course Content</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Add Chapter */}
        <div className="bg-white p-6 rounded shadow-lg border-t-4 border-blue-600">
          <div className="flex items-center gap-2 mb-4">
            <Video className="text-blue-600" />
            <h2 className="text-xl font-bold">Add Course Material</h2>
          </div>
          
          <form onSubmit={submitChapter(onAddChapter)} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input {...registerChapter('title')} className="w-full border p-2 rounded" placeholder="e.g. Intro to React" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seq #</label>
                <input type="number" {...registerChapter('sequence_order')} className="w-full border p-2 rounded" placeholder="1" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Video URL</label>
              <input {...registerChapter('video_url')} className="w-full border p-2 rounded" placeholder="https://youtube.com/..." required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">
              Add Chapter
            </button>
          </form>
        </div>

        {/* Right: Enroll Student */}
        <div className="bg-white p-6 rounded shadow-lg border-t-4 border-green-600 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="text-green-600" />
            <h2 className="text-xl font-bold">Enroll Student</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Grant a student access to this course immediately. They must already have an account.
          </p>

          <form onSubmit={submitEnroll(onEnrollStudent)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Student Email</label>
              <input 
                {...registerEnroll('email')} 
                type="email" 
                className="w-full border p-2 rounded" 
                placeholder="student@example.com" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 transition">
              Enroll Student
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}