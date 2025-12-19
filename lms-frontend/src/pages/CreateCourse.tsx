import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function CreateCourse() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      await api.post('/courses', data);
      alert('Course Created!');
      navigate('/');
    } catch (err) {
      alert('Failed to create course');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow mt-10 rounded">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input {...register('title')} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea {...register('description')} className="w-full border p-2 rounded" rows={3} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Create Course</button>
      </form>
    </div>
  );
}