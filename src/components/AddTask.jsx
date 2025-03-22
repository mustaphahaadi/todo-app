import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "../api";

const AddTask = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

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

  // ... in the handleSubmit function, update the category handling:
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        const response = await api.post("tasks/", {
          title,
          description,
          priority,
          due_date: dueDate,
          category: category || null, // Ensure proper category ID handling
          completed: false,
        });
        onAdd(response.data);
        // Reset form
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate("");
        setCategory("");
        setIsExpanded(false);
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(229, 231, 235, 0.5)',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }
    },
    form: {
      padding: '24px'
    },
    input: {
      width: '100%',
      border: 'none',
      fontSize: '18px',
      color: '#1f2937',
      outline: 'none',
      padding: '8px 0',
      borderBottom: '2px solid transparent',
      transition: 'border-color 0.2s',
      ':focus': {
        borderBottom: '2px solid #3b82f6'
      }
    },
    expandedSection: {
      marginTop: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      minHeight: '100px',
      fontSize: '16px',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      ':focus': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    },
    controlsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: 'white',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      ':hover': {
        borderColor: '#3b82f6'
      },
      ':focus': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'all 0.2s',
      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
      ':hover': {
        backgroundColor: '#2563eb',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
      }
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
          onFocus={() => setIsExpanded(true)}
        />

        {isExpanded && (
          <div style={styles.expandedSection}>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={styles.button}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                Add Task
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

AddTask.propTypes = {
  onAdd: PropTypes.func.isRequired,
};

export default AddTask;
