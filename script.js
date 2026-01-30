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

let currentAuthMode = 'login'; // 'login' ou 'register'
let selectedService = null;
let selectedPrice = 0;

// --- Gerenciamento de UI e Fluxo ---

// Alternar entre Login e Registro
window.toggleAuthMode = () => {
    const authContainer = document.getElementById('auth-container');
    const title = authContainer.querySelector('.title');
    const subtitle = authContainer.querySelector('.subtitle');
    const toggleLink = authContainer.querySelector('.toggle-auth span');
    const loginButton = authContainer.querySelector('.btn-liquid');

    if (currentAuthMode === 'login') {
        title.innerText = "Crie sua Conta";
        subtitle.innerText = "Preencha seus dados para começar.";
        loginButton.innerText = "Cadastrar";
        loginButton.onclick = registerEmail;
        toggleLink.innerText = "Fazer Login";
        currentAuthMode = 'register';
    } else {
        title.innerText = "Bem-vindo à Renatus";
        subtitle.innerText = "Faça login ou cadastre-se para agendar seu horário.";
        loginButton.innerText = "Entrar";
        loginButton.onclick = loginEmail;
        toggleLink.innerText = "Cadastre-se";
        currentAuthMode = 'login';
    }
};

// Controlar a visibilidade dos passos
function showStep(stepId) {
    document.querySelectorAll('.step-card').forEach(card => {
        card.classList.add('hidden');
        card.classList.remove('active');
    });
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.remove('hidden');
        targetStep.classList.add('active');
    }
}

window.nextStep = (nextStepId) => {
    // Validações antes de avançar
    if (nextStepId === 'step-datetime') {
        if (!selectedService) {
            alert('Por favor, selecione um serviço.');
            return;
        }
        document.getElementById('selected-service-display').innerText = selectedService.name;
    } else if (nextStepId === 'step-confirm') {
        const dateInput = document.getElementById('date-input').value;
        const timeInput = document.getElementById('time-input').value;
        if (!dateInput || !timeInput) {
            alert('Por favor, selecione uma data e um horário.');
            return;
        }
        document.getElementById('confirm-service').innerText = selectedService.name;
        document.getElementById('confirm-date').innerText = new Date(dateInput).toLocaleDateString('pt-BR');
        document.getElementById('confirm-time').innerText = timeInput;
        document.getElementById('confirm-price').innerText = `R$ ${selectedPrice.toFixed(2).replace('.', ',')}`;
    }
    showStep(nextStepId);
};

window.prevStep = (prevStepId) => {
    showStep(prevStepId);
};

window.goToHome = () => {
    showStep('step-service');
    // Limpar seleções ao voltar para o início
    selectedService = null;
    selectedPrice = 0;
    document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('date-input').value = '';
    document.getElementById('time-input').value = '';
};

// --- Funções de Autenticação ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('auth-container').classList.remove('active');
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('user-display-name').innerText = `Olá, ${user.displayName || user.email.split('@')[0]}`;
        loadAppointments(user.uid);
        goToHome(); // Sempre ir para a tela de seleção de serviço ao logar
    } else {
        document.getElementById('app-container').classList.add('hidden');
        document.getElementById('auth-container').classList.add('active');
        document.getElementById('auth-container').classList.remove('hidden');
    }
});

window.loginEmail = () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    signInWithEmailAndPassword(auth, email, pass)
        .catch(err => alert("Erro ao fazer login: " + err.message));
};

window.registerEmail = () => {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    createUserWithEmailAndPassword(auth, email, pass)
        .then(() => alert("Conta criada com sucesso! Faça login."))
        .catch(err => alert("Erro ao cadastrar: " + err.message));
};

window.loginGoogle = () => {
    signInWithPopup(auth, provider)
        .catch(err => alert("Erro ao fazer login com Google: " + err.message));
};

window.logout = () => signOut(auth);

// --- Seleção de Serviço ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedService = {
                name: card.querySelector('h4').innerText,
                id: card.dataset.service
            };
            selectedPrice = parseFloat(card.dataset.price);
        });
    });
});

// --- Agendamentos (Salvar e Carregar) ---
window.saveAppointment = () => {
    const user = auth.currentUser;
    if (!user) {
        alert("Você precisa estar logado para agendar.");
        return;
    }

    const dateInput = document.getElementById('date-input').value;
    const timeInput = document.getElementById('time-input').value;

    const data = {
        service: selectedService.name,
        serviceId: selectedService.id,
        price: selectedPrice,
        date: dateInput,
        time: timeInput,
        timestamp: new Date().getTime(), // Para ordenação
        userId: user.uid
    };
    
    push(ref(db, 'appointments/' + user.uid), data)
        .then(() => {
            alert("Agendamento confirmado com sucesso!");
            showStep('step-my-appointments');
        })
        .catch(err => alert("Erro ao agendar: " + err.message));
};

function loadAppointments(uid) {
    const list = document.getElementById('appointment-list');
    onValue(ref(db, 'appointments/' + uid), (snapshot) => {
        list.innerHTML = "";
        if (!snapshot.exists()) {
            const li = document.createElement('li');
            li.innerText = "Você não possui agendamentos.";
            list.appendChild(li);
            return;
        }
        snapshot.forEach(child => {
            const item = child.val();
            const appointmentDate = new Date(item.date + 'T' + item.time);
            const now = new Date();

            // Filtrar apenas agendamentos futuros
            if (appointmentDate > now) {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${item.date} às ${item.time}</strong> - ${item.service} (R$ ${item.price.toFixed(2).replace('.', ',')})`;
                list.appendChild(li);
            }
        });
        if (list.innerHTML === "") { // Caso não haja agendamentos futuros
            const li = document.createElement('li');
            li.innerText = "Você não possui agendamentos futuros.";
            list.appendChild(li);
        }
    });
}
