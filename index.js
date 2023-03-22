// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import {
  getAuth,
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('login');
const supmitButton = document.getElementById('toevoegen');
const addTask = document.getElementById('addTasks');
const newTask = document.getElementById('newTask');

let rsvpListener = null;
let guestbookListener = null;

let db, auth;

async function main() {
  // Add Firebase project configuration object here
  const firebaseConfig = {
    apiKey: 'AIzaSyBkiKJC7bQ8Py8rbxq8CxW0PDYVdzchmBk',
    authDomain: 'fir-codelab-9445b.firebaseapp.com',
    projectId: 'fir-codelab-9445b',
    storageBucket: 'fir-codelab-9445b.appspot.com',
    messagingSenderId: '787635457524',
    appId: '1:787635457524:web:7b125f8da7803f576ebda1',
  };

  initializeApp(firebaseConfig);
  auth = getAuth();
  db = getFirestore();

  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      },
    },
  };

  const ui = new firebaseui.auth.AuthUI(auth);

  startRsvpButton.addEventListener('click', () => {
    if (auth.currentUser) {
      // User is signed in; allows user to sign out
      signOut(auth);
    } else {
      // No user is signed in; allows user to sign in
      ui.start('#firebaseui-auth-container', uiConfig);
    }
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // verander de tekst in de knop zodat je kan uitloggen
      startRsvpButton.textContent = 'Log uit';

      // laat de dingen zien die zichtbaar zijn als je bent ingelogd
      document.getElementById('Teamleider').style.display = 'block';
      newTask.style.display = 'block';
    } else {
      startRsvpButton.textContent = 'Login';
      document.getElementById('Teamleider').style.display = 'none';
    }

    get_users(db).then(function (item) {
      for (var i = 0; i < item.length; i++) {
        if (item[i].userId == auth.currentUser.uid) {
          console.log('gebruiker bestaat');
          return;
        } else {
          console.log('nieuwe gebruiker');
          addDoc(collection(db, 'gebruikers'), {
            userId: auth.currentUser.uid,
            naam: auth.currentUser.displayName,
            positie: 'Werknemer',
          });
        }
      }
    });
  });
  supmitButton.addEventListener('click', () => {
    addDoc(collection(db, 'tasks'), {
      taak: document.getElementById('taak').value,
      timestamp: Date.now(),
    });
    document.getElementById('taak').value = '';
    addTask.style.display = 'none';
  });

  newTask.addEventListener('click', () => {
    addTask.style.display = 'block';
  });
}

async function get_users(db) {
  var gebruikers = [];

  const Users = await getDocs(collection(db, 'gebruikers'));
  Users.forEach((user) => {
    gebruikers.push(user.data());
  });
  return gebruikers;
}
main();
