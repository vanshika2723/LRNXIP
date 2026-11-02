
# Learnix Student Management Portal

A responsive Student Management Dashboard built as part of the Learnix Full Stack Web Development Internship.

## Features

- Admin dashboard with student statistics
- Student table with data fetched from the backend API
- Add Student modal form
- Real-time search by student name or domain
- Form validation and API error handling
- Responsive desktop and mobile UI
- MongoDB database integration through Express REST API

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose
- Fetch API

## Project Structure

```text
week-3-student-management-portal/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Backend Setup

1. Open the `week-2-student-management-api` folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your `.env` file with `PORT` and `MONGODB_URI`.
4. Start the backend:

   ```bash
   npm run dev
   ```

5. Confirm that the API is available at `http://localhost:5000/students`.

## Frontend Setup

Open `index.html` using the VS Code Live Server extension.

The frontend connects to the backend at:

`http://localhost:5000/students`

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/students` | Get all students |
| POST | `/students` | Add a student |
| PUT | `/students/:id` | Update student status |
| DELETE | `/students/:id` | Delete a student |

## Internship Deliverable

Week 3: Student Management Portal with frontend and backend integration.
