# TaskMaster - Advanced Todo Application

TaskMaster is a feature-rich task management application built with React and Django REST Framework.

## Features

- **User Authentication**: Secure login and registration system
- **Task Management**: Create, update, delete, and organize tasks
- **Kanban Board**: Drag-and-drop interface for task status management
- **Categories & Tags**: Organize tasks with custom categories and tags
- **Task Priorities**: Set task priorities (High, Medium, Low)
- **Due Dates & Reminders**: Never miss a deadline with due dates and reminders
- **Subtasks**: Break down complex tasks into manageable subtasks
- **Dashboard**: Visual statistics and overview of your tasks
- **Dark Mode**: Easy on the eyes with dark mode support
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Search & Filter**: Quickly find the tasks you need

## Tech Stack

### Frontend
- React 19
- React Router for navigation
- Axios for API requests
- TailwindCSS for styling
- React Beautiful DnD for drag-and-drop functionality
- Chart.js for statistics visualization

### Backend
- Django 5.1
- Django REST Framework for API
- Simple JWT for authentication
- SQLite database (can be configured for PostgreSQL)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- pip

### Installation

#### Backend Setup
1. Navigate to the backend directory:
   ```
   cd todo_backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Apply migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Run the development server:
   ```
   python manage.py runserver
   ```

#### Frontend Setup
1. Navigate to the project root directory

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5173`

## API Endpoints

- `/api/token/` - Get JWT token
- `/api/token/refresh/` - Refresh JWT token
- `/api/users/` - User management
- `/api/users/register/` - User registration
- `/api/users/me/` - Current user info
- `/api/tasks/` - Task CRUD operations
- `/api/tasks/stats/` - Task statistics
- `/api/categories/` - Category management
- `/api/tags/` - Tag management
- `/api/subtasks/` - Subtask management

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons from Heroicons
- UI inspiration from various task management apps