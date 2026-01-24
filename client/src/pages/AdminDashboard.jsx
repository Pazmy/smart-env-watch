import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const AdminDashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);

    const openImageModal = (url) => setSelectedImage(url);
    const closeImageModal = () => setSelectedImage(null);

    // Valid statuses match backend validation
    const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

    // Auth Guard & Fetch Data
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        fetchReports();
    }, [navigate]);

    const fetchReports = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/reports');
            if (response.data.success) {
                setReports(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            alert('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const updateStatus = async (id, newStatus) => {
        try {
            // Optimistic Update
            setReports(prev => prev.map(rep => 
                rep._id === id ? { ...rep, status: newStatus } : rep
            ));

            const response = await axios.patch(`http://localhost:5000/api/reports/${id}/status`, {
                status: newStatus
            });

            if (response.data.success) {
                // Optional: Show toast
                console.log('Status updated successfully');
            } else {
                // Revert if failed (simple reload for now or complex rollback)
                fetchReports(); 
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Update status error:', error);
            fetchReports(); // Revert
            alert('Error updating status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center mt-20">Loading Dashboard...</div>;

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col items-center py-6 shadow-2xl">
                <div className="text-2xl font-bold mb-10 tracking-wider text-emerald-400">
                    ENV ADMIN
                </div>
                <nav className="flex-1 w-full px-4 space-y-2">
                    <button className="w-full text-left px-4 py-3 bg-slate-800 rounded text-emerald-300 font-medium">
                        Dashboard
                    </button>
                    {/* Add more menu items here if needed */}
                </nav>
                <div className="w-full px-4 mb-4">
                    <button 
                        onClick={handleLogout}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
                        <p className="text-slate-500">Manage environmental reports and issues.</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded shadow text-slate-600">
                        Total Reports: <strong>{reports.length}</strong>
                    </div>
                </header>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4 border-b">Evidence</th>
                                <th className="px-6 py-4 border-b">Ticket ID</th>
                                <th className="px-6 py-4 border-b">Location & Desc</th>
                                <th className="px-6 py-4 border-b">AI Analysis</th>
                                <th className="px-6 py-4 border-b">Date</th>
                                <th className="px-6 py-4 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.map((report) => (
                                <tr key={report._id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div 
                                            className="w-16 h-16 rounded overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => openImageModal(report.imageUrl)}
                                        >
                                            <img 
                                                src={report.imageUrl} 
                                                alt="Evidence" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                        {report.ticketId}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <div className="text-sm font-medium text-slate-800 truncate" title={report.description}>
                                            {report.description || 'No description'}
                                        </div>
                                        {/* <div className="text-xs text-slate-400 mt-1">
                                            {report.location?.lat?.toFixed(5)}, {report.location?.lng?.toFixed(5)}
                                        </div> */}
                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <MapPin size={14} /> 
                                        <a 
                                        href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline hover:text-blue-800"
                                        >
                                        Lihat di Peta
                                        </a>
                                    </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700`}>
                                            {report.aiAnalysis?.class || 'Unknown'} 
                                            <span className="ml-1 opacity-75">
                                                ({(report.aiAnalysis?.confidence * 100).toFixed(0)}%)
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(report.createdAt).toLocaleDateString()} <br />
                                        <span className="text-xs text-slate-400">
                                            {new Date(report.createdAt).toLocaleTimeString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={report.status}
                                            onChange={(e) => updateStatus(report._id, e.target.value)}
                                            className={`px-3 py-1 rounded text-sm font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-slate-300 ${getStatusColor(report.status)}`}
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                                        No reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Image Modal */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center"
                    onClick={closeImageModal}
                >
                    <div className="relative max-w-4xl max-h-screen p-4">
                        <img 
                            src={selectedImage} 
                            alt="Evidence Fullscreen" 
                            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
                        />
                        <button 
                            className="absolute top-6 right-6 text-white text-2xl font-bold bg-black/50 hover:bg-black/70 rounded-full w-10 h-10 flex items-center justify-center transition"
                            onClick={closeImageModal}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
