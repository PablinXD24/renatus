// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQdw7hIkhoby8n_4pl41zwjEqHYNtQDRw",
  authDomain: "ecommerce-jj.firebaseapp.com",
  databaseURL: "https://ecommerce-jj-default-rtdb.firebaseio.com",
  projectId: "ecommerce-jj",
  storageBucket: "ecommerce-jj.firebasestorage.app",
  messagingSenderId: "773988929532",
  appId: "1:773988929532:web:6bff6f6ad3968436edac79"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database(); // Alterado para database()
const providerGoogle = new firebase.auth.GoogleAuthProvider();
const providerFacebook = new firebase.auth.FacebookAuthProvider();

// Admin email
const ADMIN_EMAIL = "pablo11ssousa2@gmail.com";

// Global variables
let currentUser = null;

// DOM Elements
const elements = {
    navbarLinks: document.querySelector('.navbar-links'),
    hamburger: document.querySelector('.hamburger'),
    loginBtn: document.getElementById('login-btn'),
    registerBtn: document.getElementById('register-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    dashboardLink: document.querySelector('.dashboard-link'),
    userProfile: document.getElementById('user-profile'),
    userName: document.getElementById('user-name'),
    userAvatar: document.getElementById('user-avatar'),
    loginModal: document.getElementById('login-modal'),
    registerModal: document.getElementById('register-modal'),
    confirmModal: document.getElementById('confirm-modal'),
    closeModals: document.querySelectorAll('.close-modal'),
    switchToRegister: document.getElementById('switch-to-register'),
    switchToLogin: document.getElementById('switch-to-login'),
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    registerForm: document.getElementById('register-form'),
    registerName: document.getElementById('register-name'),
    registerEmail: document.getElementById('register-email'),
    registerPhone: document.getElementById('register-phone'),
    registerPassword: document.getElementById('register-password'),
    registerConfirmPassword: document.getElementById('register-confirm-password'),
    agendamentoForm: document.getElementById('agendamento-form'),
    googleLogin: document.getElementById('google-login'),
    facebookLogin: document.getElementById('facebook-login'),
    googleRegister: document.getElementById('google-register'),
    facebookRegister: document.getElementById('facebook-register'),
    sections: document.querySelectorAll('.section'),
    homeSection: document.getElementById('home'),
    agendarSection: document.getElementById('agendar'),
    meusAgendamentosSection: document.getElementById('meus-agendamentos'),
    dashboardSection: document.getElementById('dashboard'),
    servicoSelect: document.getElementById('servico'),
    barbeiroSelect: document.getElementById('barbeiro'),
    dataInput: document.getElementById('data'),
    horaSelect: document.getElementById('hora'),
    observacoes: document.getElementById('observacoes'),
    agendamentosList: document.getElementById('agendamentos-list'),
    agendamentosHoje: document.getElementById('agendamentos-hoje'),
    agendamentosSemana: document.getElementById('agendamentos-semana'),
    ultimosAgendamentos: document.querySelector('#ultimos-agendamentos tbody'),
    confirmContent: document.getElementById('confirm-content'),
    heroAgendarBtn: document.getElementById('hero-agendar-btn')
};

// Modal functions
function showModal(modal) {
    modal.classList.add('show');
    modal.style.display = 'flex';
}

function hideModal(modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
}

function switchAuthModal(e) {
    e.preventDefault();
    if (elements.loginModal.classList.contains('show')) {
        hideModal(elements.loginModal);
        showModal(elements.registerModal);
    } else {
        hideModal(elements.registerModal);
        showModal(elements.loginModal);
    }
}

// Navigation
function navigateTo(sectionId) {
    elements.sections.forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    elements.navbarLinks.classList.remove('active');
    
    if (sectionId === 'meus-agendamentos') {
        carregarMeusAgendamentos();
    } else if (sectionId === 'dashboard') {
        carregarDashboard();
    }
    
    window.scrollTo(0, 0);
}

function toggleNavbar() {
    elements.navbarLinks.classList.toggle('active');
}

// Auth Functions
function loginWithProvider(provider) {
    let providerName = provider.providerId === 'google.com' ? 'Google' : 'Facebook';
    
    auth.signInWithPopup(provider)
        .then((result) => {
            if (result.additionalUserInfo.isNewUser) {
                return db.ref('users/' + result.user.uid).set({
                    nome: result.user.displayName || 'Usuário',
                    email: result.user.email,
                    telefone: result.user.phoneNumber || '',
                    isAdmin: result.user.email === ADMIN_EMAIL,
                    photoURL: result.user.photoURL || ''
                });
            }
        })
        .then(() => {
            hideModal(elements.loginModal);
            hideModal(elements.registerModal);
            showAlert('success', `Login com ${providerName} realizado!`);
        })
        .catch(error => {
            console.error(`Erro no login com ${providerName}:`, error);
            showAlert('error', `Erro no login: ${error.message}`);
        });
}

function handleLogin(e) {
    e.preventDefault();
    const email = elements.loginEmail.value;
    const password = elements.loginPassword.value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            hideModal(elements.loginModal);
            elements.loginForm.reset();
            showAlert('success', 'Login realizado com sucesso!');
        })
        .catch(error => {
            showAlert('error', 'Erro no login: ' + error.message);
        });
}

function handleRegister(e) {
    e.preventDefault();
    const name = elements.registerName.value;
    const email = elements.registerEmail.value;
    const phone = elements.registerPhone.value;
    const password = elements.registerPassword.value;
    const confirmPassword = elements.registerConfirmPassword.value;
    
    if (password !== confirmPassword) {
        showAlert('error', 'As senhas não coincidem!');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return db.ref('users/' + userCredential.user.uid).set({
                nome: name,
                email: email,
                telefone: phone,
                isAdmin: email === ADMIN_EMAIL,
                photoURL: ''
            });
        })
        .then(() => {
            hideModal(elements.registerModal);
            elements.registerForm.reset();
            showAlert('success', 'Conta criada com sucesso!');
        })
        .catch(error => {
            showAlert('error', 'Erro no registro: ' + error.message);
        });
}

function logout() {
    auth.signOut()
        .then(() => {
            navigateTo('home');
            showAlert('success', 'Sessão encerrada com sucesso');
        });
}

// Observer
auth.onAuthStateChanged(user => {
    currentUser = user;
    
    if (user) {
        elements.loginBtn.classList.add('hidden');
        elements.registerBtn.classList.add('hidden');
        elements.userProfile.classList.remove('hidden');
        
        db.ref('users/' + user.uid).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    elements.userName.textContent = userData.nome;
                    
                    if (user.photoURL) {
                        elements.userAvatar.src = user.photoURL;
                    } else if (userData.photoURL) {
                        elements.userAvatar.src = userData.photoURL;
                    } else {
                        const initials = userData.nome.split(' ').map(n => n[0]).join('').toUpperCase();
                        elements.userAvatar.src = `https://ui-avatars.com/api/?name=${initials}&background=6d4aff&color=fff&size=128`;
                    }
                    
                    if (userData.isAdmin || userData.email === ADMIN_EMAIL) {
                        elements.dashboardLink.classList.remove('hidden');
                    } else {
                        elements.dashboardLink.classList.add('hidden');
                    }
                }
            });
    } else {
        elements.loginBtn.classList.remove('hidden');
        elements.registerBtn.classList.remove('hidden');
        elements.userProfile.classList.add('hidden');
        elements.dashboardLink.classList.add('hidden');
        
        const currentSection = document.querySelector('.section:not(.hidden)').id;
        if (currentSection !== 'home' && currentSection !== 'agendar') {
            navigateTo('home');
        }
    }
});

// Scheduling Functions
function handleAgendamento(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showAlert('warning', 'Você precisa estar logado para agendar');
        showModal(elements.loginModal);
        return;
    }
    
    const servico = elements.servicoSelect.value;
    const barbeiro = elements.barbeiroSelect.value;
    const data = elements.dataInput.value;
    const hora = elements.horaSelect.value;
    const observacoes = elements.observacoes.value;
    
    const precoMatch = servico.match(/R\$ (\d+)/);
    const preco = precoMatch ? parseInt(precoMatch[1]) : 0;
    
    const agendamento = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        servico: servico.split(' - ')[0],
        barbeiro,
        data,
        hora,
        preco,
        observacoes,
        status: 'confirmado',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    const newRef = db.ref('agendamentos').push();
    newRef.set(agendamento)
        .then(() => {
            elements.agendamentoForm.reset();
            showAlert('success', 'Agendamento realizado com sucesso!');
            
            elements.confirmContent.innerHTML = `
                <p><strong>Serviço:</strong> ${agendamento.servico}</p>
                <p><strong>Profissional:</strong> ${agendamento.barbeiro}</p>
                <p><strong>Data:</strong> ${formatarData(data)} às ${hora}</p>
                <p><strong>Preço:</strong> R$ ${preco}</p>
            `;
            showModal(elements.confirmModal);
        })
        .catch(error => {
            showAlert('error', 'Erro ao agendar: ' + error.message);
        });
}

function carregarHorariosDisponiveis() {
    const dataSelecionada = elements.dataInput.value;
    const barbeiroSelecionado = elements.barbeiroSelect.value;
    
    if (!dataSelecionada || !barbeiroSelecionado) return;
    
    db.ref('agendamentos')
        .orderByChild('data')
        .equalTo(dataSelecionada)
        .once('value', snapshot => {
            const horariosOcupados = [];
            snapshot.forEach(child => {
                const ag = child.val();
                if (ag.barbeiro === barbeiroSelecionado && ag.status === 'confirmado') {
                    horariosOcupados.push(ag.hora);
                }
            });
            
            const todosHorarios = [];
            for (let i = 9; i <= 18; i++) {
                todosHorarios.push(`${i}:00`);
                if (i < 18) todosHorarios.push(`${i}:30`);
            }
            
            elements.horaSelect.innerHTML = '<option value="">Selecione um horário</option>';
            todosHorarios.forEach(h => {
                if (!horariosOcupados.includes(h)) {
                    const option = document.createElement('option');
                    option.value = h;
                    option.textContent = h;
                    elements.horaSelect.appendChild(option);
                }
            });
        });
}

function carregarMeusAgendamentos() {
    if (!currentUser) return;
    
    db.ref('agendamentos')
        .orderByChild('userId')
        .equalTo(currentUser.uid)
        .once('value', snapshot => {
            elements.agendamentosList.innerHTML = '';
            let hasAgendamentos = false;

            const agendamentos = [];
            snapshot.forEach(child => {
                agendamentos.push({ id: child.key, ...child.val() });
            });

            // Inverter para mostrar os mais recentes primeiro
            agendamentos.reverse().forEach(ag => {
                if (ag.status === 'confirmado') {
                    hasAgendamentos = true;
                    const card = document.createElement('div');
                    card.className = 'agendamento-card';
                    card.innerHTML = `
                        <div class="agendamento-info">
                            <h3>${ag.servico} - R$ ${ag.preco}</h3>
                            <p><strong>Profissional:</strong> ${ag.barbeiro}</p>
                            <p><strong>Data:</strong> ${formatarData(ag.data)} às ${ag.hora}</p>
                        </div>
                        <div class="agendamento-actions">
                            <button class="btn danger-btn" onclick="cancelarAgendamento('${ag.id}')">Cancelar</button>
                        </div>
                    `;
                    elements.agendamentosList.appendChild(card);
                }
            });

            if (!hasAgendamentos) {
                elements.agendamentosList.innerHTML = '<p class="empty-message">Você não possui agendamentos ativos.</p>';
            }
        });
}

function cancelarAgendamento(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        db.ref('agendamentos/' + id).update({ status: 'cancelado' })
            .then(() => {
                showAlert('success', 'Agendamento cancelado com sucesso');
                carregarMeusAgendamentos();
            })
            .catch(error => showAlert('error', 'Erro ao cancelar: ' + error.message));
    }
}

// Dashboard Admin
function carregarDashboard() {
    db.ref('agendamentos').once('value', snapshot => {
        let hojeCount = 0;
        let semanaCount = 0;
        const hoje = new Date().toISOString().split('T')[0];
        
        elements.ultimosAgendamentos.innerHTML = '';
        const agendamentos = [];
        
        snapshot.forEach(child => {
            const ag = child.val();
            if (ag.status === 'confirmado') {
                if (ag.data === hoje) hojeCount++;
                semanaCount++; // Simplificação para total ativos
                agendamentos.push(ag);
            }
        });

        elements.agendamentosHoje.textContent = hojeCount;
        elements.agendamentosSemana.textContent = semanaCount;

        agendamentos.slice(-10).reverse().forEach(ag => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ag.userEmail}</td>
                <td>${ag.servico}</td>
                <td>${ag.barbeiro}</td>
                <td>${formatarData(ag.data)}</td>
                <td>${ag.hora}</td>
            `;
            elements.ultimosAgendamentos.appendChild(row);
        });
    });
}

// Helpers
function formatarData(dataStr) {
    const data = new Date(dataStr + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(alert);
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    elements.hamburger.addEventListener('click', toggleNavbar);
    elements.loginBtn.addEventListener('click', () => showModal(elements.loginModal));
    elements.registerBtn.addEventListener('click', () => showModal(elements.registerModal));
    elements.logoutBtn.addEventListener('click', logout);
    elements.switchToRegister.addEventListener('click', switchAuthModal);
    elements.switchToLogin.addEventListener('click', switchAuthModal);
    elements.googleLogin.addEventListener('click', () => loginWithProvider(providerGoogle));
    elements.facebookLogin.addEventListener('click', () => loginWithProvider(providerFacebook));
    elements.googleRegister.addEventListener('click', () => loginWithProvider(providerGoogle));
    elements.facebookRegister.addEventListener('click', () => loginWithProvider(providerFacebook));
    
    elements.closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(elements.loginModal);
            hideModal(elements.registerModal);
            hideModal(elements.confirmModal);
        });
    });

    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.agendamentoForm.addEventListener('submit', handleAgendamento);
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.getAttribute('href').substring(1));
        });
    });
    
    elements.heroAgendarBtn.addEventListener('click', () => navigateTo('agendar'));
    elements.dataInput.addEventListener('change', carregarHorariosDisponiveis);
    elements.barbeiroSelect.addEventListener('change', carregarHorariosDisponiveis);
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) hideModal(e.target);
    });

    // Mascara telefone
    elements.registerPhone.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 0) v = '(' + v;
        if (v.length > 3) v = v.substring(0, 3) + ') ' + v.substring(3);
        if (v.length > 10) v = v.substring(0, 10) + '-' + v.substring(10, 14);
        e.target.value = v;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    const today = new Date().toISOString().split('T')[0];
    elements.dataInput.setAttribute('min', today);
    if (window.location.hash) navigateTo(window.location.hash.substring(1));
});
