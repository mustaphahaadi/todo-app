import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import TaskBoard from "./components/TaskBoard";
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";
import EditTask from "./components/EditTask";
import api from "./api";
import "./App.css";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppContent = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    // Apply dark mode on initial load
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    fetchTasks();
  }, [darkMode]);

  const fetchTasks = async () => {
    try {
      const response = await api.get("tasks/");
      setTasks(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async (newTask) => {
    try {
      const response = await api.post("tasks/", newTask);
      setTasks([...tasks, response.data]);
      return response.data;
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

  const updateTask = async (updatedTask) => {
    try {
      const response = await api.put(`tasks/${updatedTask.id}/`, updatedTask);
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? response.data : t)));
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
    active: tasks.filter((task) => !task.completed).length,
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <TaskBoard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-blue-600 dark:bg-blue-700 py-6 px-6">
                    <h1 className="text-2xl font-bold text-white">To-Do List</h1>
                    <p className="text-blue-100 text-sm mt-1">
                      {taskCounts.total} total tasks ({taskCounts.active} active,{" "}
                      {taskCounts.completed} completed)
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-center space-x-4 mb-6">
                      <button
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          filter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                        onClick={() => setFilter("all")}
                      >
                        All
                      </button>
                      <button
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          filter === "active"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                        onClick={() => setFilter("active")}
                      >
                        Active
                      </button>
                      <button
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          filter === "completed"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                        onClick={() => setFilter("completed")}
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
                        onUpdate={updateTask}
                      />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;