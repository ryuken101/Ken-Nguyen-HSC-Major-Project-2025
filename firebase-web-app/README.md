# Firebase Web App

This project is a web application that utilizes Firebase for backend services. It includes features for task management, statistics analysis, and user accountability through an interactive interface.

## Project Structure

- **public/**: Contains all the static files for the web app.
  - **index.html**: The main HTML file for the application.
  - **styles.css**: The stylesheet for the application.
  - **app.js**: The main JavaScript file for handling application logic.
  - **images/**: Directory for images used in the application.
    - **website_logo.png**: Logo for the website.
  - **Videos/**: Directory for demo videos.
    - **Task-demo.mp4**: Video demonstrating task management features.
    - **Stats-demo.mp4**: Video demonstrating statistics analysis features.
    - **Pet-demo.mp4**: Video demonstrating accountability features.
  - **Animation/**: Directory for animated images.
    - **kitten-happy.gif**: Animated GIF used in the application.

## Firebase Configuration

- **firebase.json**: Configuration file for Firebase hosting and functions.
- **.firebaserc**: Firebase project configuration file.

## Getting Started

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```
4. Initialize Firebase in your project:
   ```
   firebase init
   ```
5. Deploy your application to Firebase Hosting:
   ```
   firebase deploy
   ```

## Features

- Create and track tasks using an interactive calendar.
- Analyze and improve personal statistics.
- Stay accountable with reminders and notifications.

## License

This project is licensed under the MIT License.