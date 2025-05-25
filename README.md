
# AI Face Recognition Attendance System

This is a Next.js application demonstrating an AI-powered face recognition attendance system.

## Features

-   **Student and Admin Roles:** Separate dashboards and login flows for students and administrators.
-   **Student Registration:** Allows new students to sign up.
-   **Simulated Face Registration:** Students can simulate registering their face data via their dashboard.
-   **Automated Attendance Marking:** The main page simulates recognizing registered students via webcam and marks their attendance.
-   **Attendance Logging:** All attendance records are logged.
-   **Admin Dashboard:**
    -   View full attendance logs.
    -   AI-powered anomaly detection in attendance data.
    -   AI-powered summarization of detected anomalies.
-   **Student Dashboard:**
    -   View personal attendance records.
    -   Manage simulated face data registration.

## Tech Stack

-   Next.js (App Router)
-   React
-   TypeScript
-   Tailwind CSS
-   ShadCN UI Components
-   Genkit (for AI features)

## Getting Started

To get the application running locally:

1.  **Clone the repository (if applicable).**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will typically start the Next.js app on `http://localhost:9002` and the Genkit development server on its configured port.

4.  **Explore the application:**
    -   Register as a student.
    -   Log in as the student and simulate face data registration.
    -   Log out and observe the main attendance page "recognize" the registered student.
    -   Log in as an admin (`admin@example.com` / `adminpass`) to view logs and use AI analysis tools.

This project uses client-side storage (`localStorage`) for user data and attendance logs for simplicity. For a production environment, a proper backend database and secure authentication mechanism would be required.

To Try this quickly you can go to https://ai-attend.vercel.app/ 
it is deployed by me there.
