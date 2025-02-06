// import { useState } from "react";
import { useState } from "react";
import PropTypes from "prop-types";
import api from "../api"; // Import the custom Axios instance

const AddTask = ({ onAdd }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        const response = await api.post("tasks/", {
          title,
          completed: false,
        });
        onAdd(response.data); // Call onAdd with the new task data
        setTitle("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Add a new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="task-input"
      />
      <button type="submit" className="add-task-button">
        Add Task
      </button>
    </form>
  );
};

AddTask.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default AddTask;
