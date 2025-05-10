import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from '../api';
import AddTask from './AddTask';

const TaskBoard = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    in_progress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    priority: '',
    category: '',
    search: ''
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await api.get('categories/');
        setCategories(categoriesResponse.data);
        
        // Fetch tasks
        await fetchTasks();
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load tasks');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTasks = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filter.priority) params.append('priority', filter.priority);
      if (filter.category) params.append('category', filter.category);
      if (filter.search) params.append('search', filter.search);
      
      // Fetch all tasks
      const response = await api.get(`tasks/?${params.toString()}`);
      const allTasks = response.data.results || response.data;
      
      // Group tasks by status
      const groupedTasks = {
        todo: allTasks.filter(task => task.status === 'todo'),
        in_progress: allTasks.filter(task => task.status === 'in_progress'),
        done: allTasks.filter(task => task.status === 'done')
      };
      
      setTasks(groupedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Get the task that was dragged
    const taskId = parseInt(draggableId.split('-')[1]);
    const task = [...tasks[source.droppableId]].find(t => t.id === taskId);
    
    if (!task) return;
    
    // Create a copy of the current state
    const newTasks = { ...tasks };
    
    // Remove from source
    newTasks[source.droppableId] = newTasks[source.droppableId].filter(
      t => t.id !== taskId
    );
    
    // Update task status if moved to a different column
    const newStatus = destination.droppableId;
    const updatedTask = { 
      ...task, 
      status: newStatus,
      position: destination.index 
    };
    
    // Add to destination
    newTasks[destination.droppableId] = [
      ...newTasks[destination.droppableId].slice(0, destination.index),
      updatedTask,
      ...newTasks[destination.droppableId].slice(destination.index)
    ];
    
    // Update state optimistically
    setTasks(newTasks);
    
    // Update in the backend
    try {
      await api.put(`tasks/${taskId}/`, {
        ...task,
        status: newStatus,
        position: destination.index
      });
    } catch (err) {
      console.error('Error updating task:', err);
      // Revert to previous state on error
      fetchTasks();
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchTasks();
  };

  const resetFilters = () => {
    setFilter({
      priority: '',
      category: '',
      search: ''
    });
    fetchTasks();
  };

  const handleAddTask = (newTask) => {
    // Add the new task to the appropriate column
    setTasks(prev => ({
      ...prev,
      [newTask.status]: [newTask, ...prev[newTask.status]]
    }));
  };

  const handleDeleteTask = async (taskId, status) => {
    try {
      await api.delete(`tasks/${taskId}/`);
      setTasks(prev => ({
        ...prev,
        [status]: prev[status].filter(task => task.id !== taskId)
      }));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await api.put(`tasks/${task.id}/`, updatedTask);
      
      // Update the task in the appropriate column
      setTasks(prev => ({
        ...prev,
        [task.status]: prev[task.status].map(t => 
          t.id === task.id ? updatedTask : t
        )
      }));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

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
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Task Board</h2>
        
        <div className="mb-6">
          <AddTask onAdd={handleAddTask} categories={categories} />
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              name="search"
              placeholder="Search tasks..."
              value={filter.search}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <select
              name="priority"
              value={filter.priority}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <select
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200">
                To Do ({tasks.todo.length})
              </h3>
              <Droppable droppableId="todo">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px]"
                  >
                    {tasks.todo.map((task, index) => (
                      <Draggable
                        key={`task-${task.id}`}
                        draggableId={`task-${task.id}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex justify-between">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => handleToggleComplete(task)}
                                  className="mt-1"
                                />
                                <div>
                                  <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                                    {task.title}
                                  </h4>
                                  {task.due_date && (
                                    <p className={`text-xs ${task.is_overdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                      Due: {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                  )}
                                  {task.category_name && (
                                    <span 
                                      className="inline-block text-xs px-2 py-1 mt-2 rounded-full"
                                      style={{ 
                                        backgroundColor: task.category_color ? `${task.category_color}20` : '#e5e7eb',
                                        color: task.category_color || '#374151'
                                      }}
                                    >
                                      {task.category_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                                <button
                                  onClick={() => handleDeleteTask(task.id, task.status)}
                                  className="ml-2 text-gray-400 hover:text-red-500"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* In Progress Column */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 text-blue-700 dark:text-blue-300">
                In Progress ({tasks.in_progress.length})
              </h3>
              <Droppable droppableId="in_progress">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px]"
                  >
                    {tasks.in_progress.map((task, index) => (
                      <Draggable
                        key={`task-${task.id}`}
                        draggableId={`task-${task.id}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex justify-between">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => handleToggleComplete(task)}
                                  className="mt-1"
                                />
                                <div>
                                  <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                                    {task.title}
                                  </h4>
                                  {task.due_date && (
                                    <p className={`text-xs ${task.is_overdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                      Due: {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                  )}
                                  {task.category_name && (
                                    <span 
                                      className="inline-block text-xs px-2 py-1 mt-2 rounded-full"
                                      style={{ 
                                        backgroundColor: task.category_color ? `${task.category_color}20` : '#e5e7eb',
                                        color: task.category_color || '#374151'
                                      }}
                                    >
                                      {task.category_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                                <button
                                  onClick={() => handleDeleteTask(task.id, task.status)}
                                  className="ml-2 text-gray-400 hover:text-red-500"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* Done Column */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4 text-green-700 dark:text-green-300">
                Done ({tasks.done.length})
              </h3>
              <Droppable droppableId="done">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px]"
                  >
                    {tasks.done.map((task, index) => (
                      <Draggable
                        key={`task-${task.id}`}
                        draggableId={`task-${task.id}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 shadow-sm border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex justify-between">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => handleToggleComplete(task)}
                                  className="mt-1"
                                />
                                <div>
                                  <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>
                                    {task.title}
                                  </h4>
                                  {task.due_date && (
                                    <p className={`text-xs ${task.is_overdue ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                      Due: {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                  )}
                                  {task.category_name && (
                                    <span 
                                      className="inline-block text-xs px-2 py-1 mt-2 rounded-full"
                                      style={{ 
                                        backgroundColor: task.category_color ? `${task.category_color}20` : '#e5e7eb',
                                        color: task.category_color || '#374151'
                                      }}
                                    >
                                      {task.category_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                                <button
                                  onClick={() => handleDeleteTask(task.id, task.status)}
                                  className="ml-2 text-gray-400 hover:text-red-500"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default TaskBoard;