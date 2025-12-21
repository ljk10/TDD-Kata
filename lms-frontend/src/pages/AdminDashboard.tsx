import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, BookOpen, CheckCircle, UserPlus, X } from 'lucide-react'; 

interface User {
  id: string;
  email: string;
  role: string;
  is_approved: boolean;
  courses: { id: string; title: string }[];
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]); 
  const [loading, setLoading] = useState(true);
  
  
  const [showModal, setShowModal] = useState(false);
  const [newMentorEmail, setNewMentorEmail] = useState('');
  const [newMentorPassword, setNewMentorPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/admin/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(); 
    } catch (err) {
      alert("Failed to approve user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  
  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/admin/mentors', 
        { email: newMentorEmail, password: newMentorPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Mentor added successfully!");
      setShowModal(false);
      setNewMentorEmail('');
      setNewMentorPassword('');
      fetchUsers(); 
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create mentor");
    }
  };

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        
        {}
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold shadow-md transition"
        >
          <UserPlus size={20} /> Add Mentor
        </button>
      </div>
      
      
      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase">User</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase">Role</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase">Courses</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-5 border-b border-gray-200 text-sm font-medium">{user.email}</td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'mentor' ? 'bg-purple-100 text-purple-700' : user.role === 'admin' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-700'}`}>
                     {user.role}
                   </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                   {user.courses?.length > 0 ? (
                       <ul className="space-y-1">
                           {user.courses.map(c => <li key={c.id} className="flex items-center gap-2 text-xs text-gray-600"><BookOpen size={10}/> {c.title}</li>)}
                       </ul>
                   ) : <span className="text-gray-400 text-xs italic">No courses</span>}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm flex gap-2">
                  {!user.is_approved && (
                    <button onClick={() => handleApprove(user.id)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><CheckCircle size={18}/></button>
                  )}
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-96 relative animate-fade-in">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Mentor</h2>
            <form onSubmit={handleAddMentor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newMentorEmail}
                  onChange={(e) => setNewMentorEmail(e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="mentor@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                <input 
                  type="password" 
                  required 
                  value={newMentorPassword}
                  onChange={(e) => setNewMentorPassword(e.target.value)}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="********"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-bold"
              >
                Create Mentor Account
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;