import { useState, useEffect } from "react";
import api from "./api"; // Import the custom Axios instance
import TaskList from "./components/TaskList";
import AddTask from "./components/AddTask";
import "./App.css";

const App = () => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await api.get("tasks/"); // Use the custom Axios instance
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Add a new task
  const addTask = async (title) => {
    try {
      const response = await api.post("tasks/", {
        // Use the custom Axios instance
        title,
        completed: false,
      });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await api.delete(`tasks/${id}/`); // Use the custom Axios instance
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Toggle task completion status
  const toggleTask = async (id) => {
    try {
      const task = tasks.find((task) => task.id === id);
      const response = await api.put(`tasks/${id}/`, {
        // Use the custom Axios instance
        ...task,
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  return (
    <div className="App">
      <h1>To-Do List</h1>
      <AddTask onAdd={addTask} />
      <TaskList tasks={tasks} onDelete={deleteTask} onToggle={toggleTask} />
    </div>
  );
};

export default App;
