import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch task statistics
        const statsResponse = await api.get('tasks/stats/');
        setStats(statsResponse.data);
        
        // Fetch recent tasks
        const tasksResponse = await api.get('tasks/?limit=5');
        setRecentTasks(tasksResponse.data.results || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {currentUser?.first_name || currentUser?.username}!
        </h2>
        <p className="text-gray-600">
          Here's an overview of your tasks
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Task Summary</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Tasks</p>
              </div>
              <div className="flex flex-col">
                <span className="text-green-600 font-medium">{stats.completed} Completed</span>
                <span className="text-amber-600 font-medium">{stats.active} Active</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Priority Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-red-600 font-medium">High</span>
                <span className="text-gray-700">{stats.by_priority.high}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-600 font-medium">Medium</span>
                <span className="text-gray-700">{stats.by_priority.medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Low</span>
                <span className="text-gray-700">{stats.by_priority.low}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">To Do</span>
                <span className="text-gray-700">{stats.by_status.todo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">In Progress</span>
                <span className="text-gray-700">{stats.by_status.in_progress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Done</span>
                <span className="text-gray-700">{stats.by_status.done}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Recent Tasks</h3>
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </Link>
        </div>
        
        {recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div 
                key={task.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      readOnly
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div className="ml-3">
                      <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.title}
                      </h4>
                      {task.due_date && (
                        <p className={`text-xs ${task.is_overdue ? 'text-red-600' : 'text-gray-500'}`}>
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent tasks found</p>
        )}
      </div>

      <div className="flex justify-center">
        <Link 
          to="/new-task" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Create New Task
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;