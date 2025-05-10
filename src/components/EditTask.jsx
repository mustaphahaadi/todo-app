import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../api";

const EditTask = ({ task, onUpdate, onCancel }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "medium");
  const [dueDate, setDueDate] = useState(
    task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ""
  );
  const [category, setCategory] = useState(task.category || "");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("categories/");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        const response = await api.put(`tasks/${task.id}/`, {
          title,
          description,
          priority,
          due_date: dueDate,
          category: category || null,
          completed: task.completed,
        });
        onUpdate(response.data);
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    container: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '90%',
      maxWidth: '500px',
      overflow: 'hidden',
      animation: 'fadeIn 0.3s ease-out',
    },
    header: {
      backgroundColor: '#3b82f6',
      padding: '16px 24px',
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold',
    },
    form: {
      padding: '24px',
    },
    input: {
      width: '100%',
      border: 'none',
      borderBottom: '2px solid #e5e7eb',
      fontSize: '18px',
      color: '#1f2937',
      outline: 'none',
      padding: '8px 0',
      marginBottom: '20px',
      transition: 'border-color 0.2s',
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      minHeight: '100px',
      fontSize: '16px',
      marginBottom: '20px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    controlsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '24px',
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: 'white',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    saveButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
    cancelButton: {
      backgroundColor: '#f3f4f6',
      color: '#4b5563',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'all 0.2s',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.header}>Edit Task</div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            required
          />

          <textarea
            placeholder="Task description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
          />

          <div style={styles.controlsGrid}>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.select}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={styles.select}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.select}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={onCancel}
              style={styles.cancelButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.saveButton}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditTask.propTypes = {
  task: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EditTask;