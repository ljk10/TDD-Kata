import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // Import useForm
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Check, Shield, LogOut, Users, UserPlus, X } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: string;
  is_approved: boolean;
  courses: string[];
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm(); // Form hooks
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [pendingMentors, setPendingMentors] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false); // Toggle state

  // Fetch Data
  const fetchData = async () => {
    try {
      const resUsers = await api.get('/admin/users');
      setUsers(resUsers.data);
      const pending = resUsers.data.filter((u: UserData) => u.role === 'mentor' && !u.is_approved);
      setPendingMentors(pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/mentors/${id}/approve`);
      alert('Mentor approved!');
      fetchData();
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleCreateMentor = async (data: any) => {
    try {
      await api.post('/admin/mentors', data);
      alert(`Success! Mentor ${data.email} created.`);
      reset(); // Clear form
      setShowCreateForm(false); // Close form
      fetchData(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create mentor');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header */}
      <nav className="bg-purple-700 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield size={28} />
            <h1 className="text-xl font-bold">Admin Console</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded transition text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* --- ACTIONS BAR --- */}
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
             <button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
             >
                {showCreateForm ? <X size={20} /> : <UserPlus size={20} />}
                {showCreateForm ? 'Cancel' : 'Add New Mentor'}
             </button>
        </div>

        {/* --- CREATE MENTOR FORM (Toggleable) --- */}
        {showCreateForm && (
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 animate-fade-in-down">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Create Mentor Profile</h3>
                <form onSubmit={handleSubmit(handleCreateMentor)} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input {...register('email', {required: true})} type="email" placeholder="mentor@company.com" className="w-full border p-2 rounded" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input {...register('password', {required: true})} type="password" placeholder="Min 6 chars" className="w-full border p-2 rounded" />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                        Create
                    </button>
                </form>
            </div>
        )}

        {/* --- PENDING APPROVALS --- */}
        {pendingMentors.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">⚠️ Pending Approvals</h2>
            <div className="space-y-3">
              {pendingMentors.map((mentor) => (
                <div key={mentor.id} className="flex items-center justify-between bg-yellow-50 p-3 rounded border border-yellow-100">
                  <span className="font-medium text-gray-700">{mentor.email}</span>
                  <button onClick={() => handleApprove(mentor.id)} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm font-bold">
                    <Check size={14} /> Approve Access
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- USER DATABASE --- */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b flex items-center gap-2">
            <Users className="text-gray-500" />
            <h2 className="text-xl font-bold text-gray-800">User Database</h2>
          </div>
          
          {loading ? <div className="p-10 text-center">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <th className="p-4 border-b">Email</th>
                    <th className="p-4 border-b">Role</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b">Courses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium">{u.email}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${u.role === 'mentor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                      <td className="p-4 text-sm">{u.role === 'mentor' ? (u.is_approved ? <span className="text-green-600 flex items-center gap-1"><Check size={12}/> Active</span> : <span className="text-yellow-600">Pending</span>) : <span className="text-gray-400">Active</span>}</td>
                      <td className="p-4">{u.courses.length > 0 ? u.courses.join(', ') : <span className="text-gray-400 text-sm italic">None</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}