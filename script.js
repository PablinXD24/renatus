import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEG84kLya9LIK7TwAjsAxbP_FxcW4TGO4",
  authDomain: "renatus-4ecbf.firebaseapp.com",
  projectId: "renatus-4ecbf",
  storageBucket: "renatus-4ecbf.firebasestorage.app",
  messagingSenderId: "1022949355642",
  appId: "1:1022949355642:web:70055d55204e1932becbc3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// Alternar telas
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('user-name').innerText = `Olá, ${user.displayName || user.email}`;
        loadAppointments(user.uid);
    } else {
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('app-container').classList.add('hidden');
    }
});

// Funções de Auth (Globais para o HTML)
window.loginEmail = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
};

window.loginGoogle = () => {
    signInWithPopup(auth, provider).catch(err => alert(err.message));
};

window.logout = () => signOut(auth);

// Salvar Agendamento
window.saveAppointment = () => {
    const user = auth.currentUser;
    const data = {
        service: document.getElementById('service').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        userId: user.uid
    };
    
    if(!data.date || !data.time) return alert("Preencha todos os campos");

    push(ref(db, 'appointments/' + user.uid), data)
        .then(() => alert("Agendado com sucesso!"))
        .catch(err => alert(err.message));
};

// Carregar Agendamentos
function loadAppointments(uid) {
    const list = document.getElementById('appointment-list');
    onValue(ref(db, 'appointments/' + uid), (snapshot) => {
        list.innerHTML = "";
        snapshot.forEach(child => {
            const item = child.val();
            const li = document.createElement('li');
            li.innerText = `${item.date} às ${item.time} - ${item.service}`;
            list.appendChild(li);
        });
    });
}
