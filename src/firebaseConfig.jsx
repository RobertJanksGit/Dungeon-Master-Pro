import { getFirestore, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBkfIFaW7T0Fxvnhe9Udc48rZKuIkEBPRY",
  authDomain: "dungeon-master-pro.firebaseapp.com",
  projectId: "dungeon-master-pro",
  storageBucket: "dungeon-master-pro.appspot.com",
  messagingSenderId: "670514258390",
  appId: "1:670514258390:web:4d85ee0d7e44c689400477",
  measurementId: "G-P15F99BHYE",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const login = async (
  email,
  setEmail,
  password,
  setPassword,
  setIsFailedLogin
) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setEmail("");
    setPassword("");
    setIsFailedLogin(false);
    return true;
  } catch (error) {
    setIsFailedLogin(true);
    console.error("Login error:", error.message);
    return false;
  }
};

const signup = async (email, setEmail, password, setPassword) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    setEmail("");
    setPassword("");
    // Create a Firestore document for the user
    await setDoc(doc(db, "users", user.uid), {
      prompt: [
        {
          role: "system",
          content:
            "You are the Dungeon Master in a game of Dungeons & Dragons. Your role is to craft an engaging fantasy story, narrate vivid descriptions, and respond to the player’s actions, questions, and decisions in real time. Start by introducing the setting, characters, and current scenario, and wait for player input before continuing. As the story progresses, be creative, use dramatic flair, and always keep the player’s experience at the center. Make sure to keep the atmosphere mysterious and adventurous. Adjust the storyline or challenges based on player responses, and prompt the player with options when needed. You’re allowed to generate magical events, mythical creatures, and describe the environment with sensory details like sounds, sights, and smells. Encourage the player to explore, interact with characters, and make decisions that will shape their journey. Remember, you are the guide on an epic quest.",
        },
      ],
      createdAt: new Date(),
    });

    console.log("User registered and Firestore document created!");
  } catch (error) {
    console.error("Signup error", error.message);
  }
};

const logout = () => {
  setTimeout(async () => {
    await signOut(auth);
  }, 10);
};

export { login, signup, logout, auth, db };
