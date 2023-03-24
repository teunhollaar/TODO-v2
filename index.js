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
  Timestamp,
} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('login');
const submitButton = document.getElementById('toevoegen');
const addTask = document.getElementById('addTasks');
const newTask = document.getElementById('newTask');
const table = document.getElementById('tabel');

var rol;
var taak_knoppen = [];

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
    } else {
      startRsvpButton.textContent = 'Login';
      document.getElementById('Teamleider').style.display = 'none';
    }

    get_users(db).then(function (item) {
      for (var i = 0; i < item.length; i++) {
        if (item[i].userId == auth.currentUser.uid) {
          console.log('gebruiker bestaat');

          if (item[i].positie == 'Teamleider') {
            console.log('gebruiker is teamleider');
            newTask.style.display = 'inline-block';
          }
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
  submitButton.addEventListener('click', () => {
    addDoc(collection(db, 'tasks'), {
      taak: document.getElementById('taak').value,
      timestamp: Date.now(),
      meeBezig: '',
      Klaar: 'false',
    });
    document.getElementById('taak').value = '';
    addTask.style.display = 'none';
    load_table(db);
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

function add_row(taak_data) {
  var row = document.createElement('tr');

  for (var i = 0; i < taak_data.length; i++) {
    var collum = document.createElement('td');

    collum.innerHTML = taak_data[i];
    row.appendChild(collum);
  }
  var buttoncell = document.createElement('td');
  var button = document.createElement('button');
  //elke taak heeft ook een id nodig om de knoppen te linken we gebruiken hiervoor de timestamp omdat deze per miliseconde gaat is het realistisch onmogelijk 2 de zelfde timestamps te maken
  button.id = taak_data[1];
  button.innerHTML = 'Begin';

  taak_knoppen.push(button);

  buttoncell.appendChild(button);

  row.appendChild(buttoncell);
  table.appendChild(row);
}

async function load_table(db) {
  var taken = [];

  while (table.hasChildNodes()) {
    table.removeChild(table.lastChild);
  }

  const tasks = await getDocs(
    collection(db, 'tasks'),
    orderBy('timestamp', 'desc')
  );
  tasks.forEach((task) => {
    taken.push(task.data());
  });

  for (var i = 0; i < taken.length; i++) {
    var taak = taken[i];
    if (taak.meeBezig == '') {
      add_row([taak.taak, taak.timestamp, 'moet nog gebeuren']);
    } else {
      if (taak.Klaar == true) {
        add_row([taak.taak, taak.timestamp, 'klaar']);
      } else {
        add_row([taak.taak, taak.timestamp, taak.meeBezig]);
      }
    }
  }
  for (var i = 0; i < taak_knoppen.length; i++) {
    var id = taak_knoppen[i].id;
    taak_knoppen[i].addEventListener('click', () => {
      console.log(id);
    });
  }
}

main();
load_table(db);
