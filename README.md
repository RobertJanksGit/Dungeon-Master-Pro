# Dungeon Master Pro v1.0

## APP SUMMARY

Dungeon Master Pro is a web app that utilizes AI to help D&D game masters craft immersive campaigns, characters, and narratives. The app provides tools for generating dynamic storylines, character images, and a map creator with voice-to-text for storytelling. This application is built using React, Firebase, and integrates with AI-driven APIs.

## Table of Contents

- [Stack](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/README.md#stack)
- [Features](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/README.md#features)
- [Features Requested](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/README.md#features-requested)
- [Learning Update](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/README.md#learning-update)

## STACK

- Frontend: React, Tailwind CSS for responsive and modern UI design
- Backend: Node.js with Express for handling API requests and managing server-side logic.
- Database: Firebase Firestore for storing campaign data and user information.
- Authentication: Firebase Authentication for secure user login and signup.
- AI Integration: OpenAI API for generating campaign content and character images, along with voice-to-text services.
- Deployment: Hosted on Firebase Hosting for fast, secure, and reliable access.

## FEATURES

- AI-Powered Story Generation: Dynamic campaign storylines tailored to user prompts.
- Character Image Generation: AI-generated character visuals to bring stories to life.
- Map Creation Tool: A drawing pad for creating custom campaign maps.
- Voice-to-Text Story Narration: Allows GMs to narrate stories in real-time.
- Secure Login & Signup: Managed with Firebase authentication for secure access to the app.
- Persistent Story State: Saves conversation and user prompts to Firestore to resume story progression anytime.

## FEATURES REQUESTED

- Session Summary and Recap: Auto-generate summaries of previous sessions to help players recall story events.
- NPC Library: Pre-built library of non-player characters (NPCs) with unique personalities, stats, and backgrounds.
- Dice Roller Integration: An in-app virtual dice roller for game-related randomness.

## LEARNING UPDATE

### State Management

Leveraged React’s useState and useEffect hooks to manage and persist user interactions and API responses effectively.

### Firestore Data Persistence

Implemented Firestore integration to store and retrieve conversation history, ensuring that users can pick up from where they left off in their campaigns.

### Authentication and Routing

Deepened understanding of Firebase Authentication and how to secure routes in React apps.

### API Integration

Improved ability to make API calls to external AI services for generating content and handling the response data within a stateful React component.

## REFERENCES

- [App.jsx](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/src/App.jsx) - [FirebaseConfig.jsx](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/src/firebaseConfig.jsx) - [dashboardMain.jsx](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/src/components/DashboardMain.jsx) - [Login.jsx](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/src/pages/Login.jsx) - [signup.jsx](https://github.com/RobertJanksGit/Dungeon-Master-Pro/blob/main/src/pages/signup.jsx)

#### Contact RobertJanksGit :: robet.jank@yahoo.com
