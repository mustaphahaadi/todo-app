# To-Do List Application

A simple To-Do List application built with React and Django REST Framework. This application allows users to add, delete, and toggle the completion status of tasks.

## Features

- Add new tasks
- Delete tasks
- Toggle task completion status
- Responsive design

## Technologies Used

- **Frontend**:

  - React
  - Vite
  - Axios
  - PropTypes
  - CSS

- **Backend**:
  - Django
  - Django REST Framework

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Python (v3.6 or later)
- Django (v3.2 or later)
- Django REST Framework

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/todo-app.git
   cd todo-app
   ```

2. **Set up the backend:**

   - Navigate to the backend directory (if applicable).
   - Install the required Python packages:

     ```bash
     pip install -r requirements.txt
     ```

   - Run the Django migrations:

     ```bash
     python manage.py migrate
     ```

   - Start the Django server:

     ```bash
     python manage.py runserver
     ```

3. **Set up the frontend:**

   - Navigate to the frontend directory:

     ```bash
     cd frontend
     ```

   - Install the required Node packages:

     ```bash
     npm install
     ```

   - Start the Vite development server:

     ```bash
     npm run dev
     ```

4. **Access the application:**

   Open your browser and go to `http://localhost:3000` to view the application.

## Usage

- Use the input field to add new tasks.
- Click the checkbox next to a task to mark it as completed.
- Click the delete button (🗑️) to remove a task from the list.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Django](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Vite](https://vitejs.dev/)
