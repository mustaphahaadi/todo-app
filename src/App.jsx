import { useState, useEffect } from "react";
import api from "./api";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";


const App = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      const response = await api.get("tasks/");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (title) => {
    try {
      const response = await api.post("tasks/", {
        title,
        completed: false,
      });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`tasks/${id}/`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleTask = async (id) => {
    try {
      const task = tasks.find((task) => task.id === id);
      const response = await api.put(`tasks/${id}/`, {
        ...task,
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    active: tasks.filter(task => !task.completed).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 py-6 px-6">
            <h1 className="text-2xl font-bold text-white">To-Do List</h1>
            <p className="text-blue-100 text-sm mt-1">
              {taskCounts.total} total tasks ({taskCounts.active} active, {taskCounts.completed} completed)
            </p>
          </div>
          
          <div className="p-6">
            <div className="flex justify-center space-x-4 mb-6">
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'active' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'completed' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
            
            <AddTask onAdd={addTask} />
            
            <div className="mt-6">
              <TaskList 
                tasks={filteredTasks} 
                onDelete={deleteTask} 
                onToggle={toggleTask} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
