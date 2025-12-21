import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, Lock, PlayCircle, Download } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  description: string;
  video_url: string;
  sequence_order: number;
  isCompleted: boolean;
  isLocked: boolean;
}

export default function CoursePlayer() {
  // 👇 FIX 1: Use 'id' (or whatever matches your Route path in App.tsx)
  // If your route is path="/course/:id", this MUST be 'id'
  const { id } = useParams<{ id: string }>(); 
  
  // We can rename it to courseId for clarity inside this component if you want
  const courseId = id; 

  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Chapters & Progress
  const loadContent = async () => {
    // 👇 FIX 2: Add a safety check. If ID is missing, don't fetch.
    if (!courseId) return;

    try {
      // 👇 Uses the valid courseId now
      const res = await api.get(`/courses/${courseId}/chapters`);
      setChapters(res.data);
      
      if (!activeChapter && res.data.length > 0) {
        const nextUp = res.data.find((c: Chapter) => !c.isCompleted && !c.isLocked) || res.data[0];
        setActiveChapter(nextUp);
      }
    } catch (err) {
      console.error("Failed to load chapters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadContent(); 
  }, [courseId]); // Dependencies updated

  // Handle "Mark as Complete"
  const handleComplete = async () => {
    if (!activeChapter) return;
    try {
      await api.post(`/progress/${activeChapter.id}/complete`);
      await loadContent(); 
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error completing chapter');
    }
  };

  // Handle Certificate Download
  const downloadCertificate = async () => {
    try {
      const response = await api.get(`/certificates/${courseId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Complete all chapters first!");
    }
  };

  if (loading) return <div className="p-10">Loading Player...</div>;
  if (!courseId) return <div className="p-10 text-red-500">Error: Invalid Course ID</div>;

  // Calculate Progress
  const completedCount = chapters.filter(c => c.isCompleted).length;
  const progressPercent = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0;
  const isCourseCompleted = progressPercent === 100 && chapters.length > 0;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Sidebar: Chapter List */}
      <div className="w-80 bg-white shadow-lg flex flex-col z-10">
        <div className="p-4 border-b">
            <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-blue-600 mb-2">← Back to Dashboard</button>
            <h2 className="font-bold text-gray-800">Course Content</h2>
            
            {/* Progress Bar */}
            <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
            {chapters.map((chapter) => (
                <div 
                    key={chapter.id}
                    onClick={() => !chapter.isLocked && setActiveChapter(chapter)}
                    className={`p-4 border-b cursor-pointer flex items-center justify-between transition
                        ${activeChapter?.id === chapter.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'}
                        ${chapter.isLocked ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    <div className="flex items-center gap-3">
                        {chapter.isLocked ? <Lock size={16} /> : <PlayCircle size={16} className={chapter.isCompleted ? 'text-green-500' : 'text-gray-400'} />}
                        <div>
                            <p className="text-sm font-medium text-gray-800">Chapter {chapter.sequence_order}</p>
                            <p className="text-xs text-gray-500 truncate w-40">{chapter.title}</p>
                        </div>
                    </div>
                    {chapter.isCompleted && <CheckCircle size={16} className="text-green-500" />}
                </div>
            ))}
        </div>

        {/* Certificate Button */}
        <div className="p-4 border-t bg-gray-50">
            <button 
                onClick={downloadCertificate}
                disabled={!isCourseCompleted}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded font-bold text-sm transition
                    ${isCourseCompleted ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg animate-pulse' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
            >
                <Download size={16} />
                Download Certificate
            </button>
        </div>
      </div>

      {/* Main Content: Video Player */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto">
         {activeChapter ? (
            <div className="max-w-4xl mx-auto w-full">
                <div className="aspect-video bg-black rounded-lg shadow-xl overflow-hidden mb-6">
                    <iframe 
                        className="w-full h-full"
                        src={activeChapter.video_url?.replace('watch?v=', 'embed/')} 
                        title="Video Player"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">{activeChapter.title}</h1>
                        <button 
                            onClick={handleComplete}
                            disabled={activeChapter.isCompleted}
                            className={`px-6 py-2 rounded-full font-bold transition flex items-center gap-2
                                ${activeChapter.isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}
                            `}
                        >
                            {activeChapter.isCompleted ? (
                                <> <CheckCircle size={18} /> Completed </>
                            ) : 'Mark as Complete'}
                        </button>
                    </div>
                    <p className="text-gray-600">
                        {activeChapter.description || "Watch the video above and click complete to proceed to the next chapter."}
                    </p>
                </div>
            </div>
         ) : (
             <div className="flex items-center justify-center h-full text-gray-500">Select a chapter to begin</div>
         )}
      </div>
    </div>
  );
}