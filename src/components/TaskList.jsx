import PropTypes from "prop-types";

const TaskList = ({ tasks, onDelete, onToggle }) => {
  const styles = {
    container: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    taskItem: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(229, 231, 235, 0.5)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    },
    taskContent: {
      padding: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      position: 'relative'
    },
    checkbox: {
      width: '22px',
      height: '22px',
      borderRadius: '6px',
      cursor: 'pointer',
      accentColor: '#3b82f6'
    },
    taskInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    taskTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0'
    },
    taskDescription: {
      fontSize: '15px',
      color: '#4b5563',
      lineHeight: '1.5',
      margin: '0'
    },
    taskMeta: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '8px'
    },
    badge: {
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500',
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#bae6fd'
      }
    },
    actions: {
      display: 'flex',
      gap: '12px'
    },
    actionButton: {
      padding: '8px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.2s',
      fontSize: '20px',
      ':hover': {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        transform: 'scale(1.1)'
      }
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280',
      fontSize: '16px',
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      margin: '20px 0'
    }
  };

  // Update getPriorityStyle function for more modern badges
  const getPriorityStyle = (priority) => {
    const baseStyle = styles.badge;
    switch (priority) {
      case 'high':
        return { ...baseStyle, backgroundColor: '#fef2f2', color: '#991b1b' };
      case 'medium':
        return { ...baseStyle, backgroundColor: '#fffbeb', color: '#92400e' };
      case 'low':
        return { ...baseStyle, backgroundColor: '#f0fdf4', color: '#166534' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
        <p>No tasks to display</p>
      </div>
    );
  }

  return (
    <ul style={styles.container}>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            ...styles.taskItem,
            opacity: task.completed ? 0.7 : 1
          }}
        >
          <div style={styles.taskContent}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              style={styles.checkbox}
            />
            
            <div style={styles.taskInfo}>
              <h3 style={{
                ...styles.taskTitle,
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? '#9ca3af' : '#1f2937'
              }}>
                {task.title}
              </h3>
              
              {task.description && (
                <p style={styles.taskDescription}>{task.description}</p>
              )}
              
              <div style={styles.taskMeta}>
                {task.category_name && (
                  <span style={styles.categoryBadge}>
                    📁 {task.category_name}
                  </span>
                )}
                <span style={getPriorityStyle(task.priority)}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                {task.due_date && (
                  <span>Due: {new Date(task.due_date).toLocaleString()}</span>
                )}
              </div>
            </div>
            
            <div style={styles.actions}>
              <button
                style={styles.actionButton}
                onClick={() => onDelete(task.id)}
                onMouseOver={(e) => e.target.style.color = '#ef4444'}
                onMouseOut={(e) => e.target.style.color = '#666'}
              >
                🗑️
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default TaskList;
