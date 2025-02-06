// import React from "react";
import PropTypes from "prop-types";

const TaskList = ({ tasks, onDelete, onToggle }) => {
  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`task-item ${task.completed ? "completed" : ""}`}
        >
          <div className="task-content">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task.id)}
              className="task-checkbox"
            />
            <span className="task-title" onClick={() => onToggle(task.id)}>
              {task.title}
            </span>
          </div>
          <button className="delete-btn" onClick={() => onDelete(task.id)}>
            🗑️
          </button>
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
