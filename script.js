// Firebase Configuration
 const firebaseConfig = {
    apiKey: "AIzaSyBTAsZ3AoaqZ-_o4LeAdqtxIr8F_Du0NKg",
    authDomain: "renatus-16ae9.firebaseapp.com",
    projectId: "renatus-16ae9",
    storageBucket: "renatus-16ae9.firebasestorage.app",
    messagingSenderId: "792013371623",
    appId: "1:792013371623:web:ca8ce17514aab06fc44a42"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
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

function toggleModal(modal) {
    document.querySelectorAll('.modal').forEach(m => hideModal(m));
    showModal(modal);
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

// Toggle mobile navbar
function toggleNavbar() {
    elements.navbarLinks.classList.toggle('active');
}

// Switch between auth modals
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

// Social login
function loginWithProvider(provider) {
    let providerName = provider.providerId === 'google.com' ? 'Google' : 'Facebook';
    
    auth.signInWithPopup(provider)
        .then((result) => {
            if (result.additionalUserInfo.isNewUser) {
                return db.collection('users').doc(result.user.uid).set({
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

// Email/password authentication
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
        showAlert('error', 'As senhas não coincidem');
        return;
    }
    
    if (password.length < 6) {
        showAlert('error', 'A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return db.collection('users').doc(userCredential.user.uid).set({
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
            showAlert('success', 'Registro realizado com sucesso!');
        })
        .catch(error => {
            showAlert('error', 'Erro no registro: ' + error.message);
        });
}

function logout() {
    auth.signOut()
        .then(() => {
            navigateTo('home');
            showAlert('success', 'Logout realizado com sucesso');
        })
        .catch(error => {
            showAlert('error', 'Erro ao fazer logout: ' + error.message);
        });
}

// Auth state observer
auth.onAuthStateChanged(user => {
    currentUser = user;
    
    if (user) {
        elements.loginBtn.classList.add('hidden');
        elements.registerBtn.classList.add('hidden');
        elements.userProfile.classList.remove('hidden');
        
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
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
            })
            .catch(error => {
                console.error('Erro ao carregar dados do usuário:', error);
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

// Scheduling functions
function handleAgendamento(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showAlert('error', 'Você precisa estar logado para agendar');
        showModal(elements.loginModal);
        return;
    }
    
    const servico = elements.servicoSelect.value;
    const barbeiro = elements.barbeiroSelect.value;
    const data = elements.dataInput.value;
    const hora = elements.horaSelect.value;
    const observacoes = elements.observacoes.value;
    
    if (!servico || !barbeiro || !data || !hora) {
        showAlert('error', 'Preencha todos os campos obrigatórios');
        return;
    }
    
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
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        adminEmail: ADMIN_EMAIL
    };
    
    db.collection('agendamentos').add(agendamento)
        .then((docRef) => {
            console.log('Agendamento criado com ID:', docRef.id);
            elements.agendamentoForm.reset();
            showAlert('success', 'Agendamento realizado!');
            
            elements.confirmContent.innerHTML = `
                <p><strong>Serviço:</strong> ${servico.split(' - ')[0]}</p>
                <p><strong>Profissional:</strong> ${barbeiro}</p>
                <p><strong>Data:</strong> ${formatarData(data)} às ${hora}</p>
                <p><strong>Preço:</strong> R$ ${preco}</p>
                ${observacoes ? `<p><strong>Observações:</strong> ${observacoes}</p>` : ''}
            `;
            showModal(elements.confirmModal);
            
            // Atualiza a lista de agendamentos imediatamente
            if (!elements.meusAgendamentosSection.classList.contains('hidden')) {
                carregarMeusAgendamentos();
            }
        })
        .catch(error => {
            console.error('Erro ao criar agendamento:', error);
            showAlert('error', 'Erro ao agendar: ' + error.message);
        });
}

function carregarHorariosDisponiveis() {
    const dataSelecionada = elements.dataInput.value;
    const barbeiroSelecionado = elements.barbeiroSelect.value;
    
    if (!dataSelecionada || !barbeiroSelecionado) return;
    
    elements.horaSelect.innerHTML = '<option value="">Selecione um horário</option>';
    elements.horaSelect.disabled = true;
    
    db.collection('agendamentos')
        .where('barbeiro', '==', barbeiroSelecionado)
        .where('data', '==', dataSelecionada)
        .where('status', '==', 'confirmado')
        .get()
        .then(querySnapshot => {
            const horariosOcupados = querySnapshot.docs.map(doc => doc.data().hora);
            const todosHorarios = [];
            
            for (let i = 9; i <= 18; i++) {
                todosHorarios.push(`${i}:00`);
                if (i < 18) todosHorarios.push(`${i}:30`);
            }
            
            const horariosDisponiveis = todosHorarios.filter(hora => !horariosOcupados.includes(hora));
            
            horariosDisponiveis.forEach(hora => {
                const option = document.createElement('option');
                option.value = hora;
                option.textContent = hora;
                elements.horaSelect.appendChild(option);
            });
            
            elements.horaSelect.disabled = false;
        })
        .catch(error => {
            console.error('Erro ao carregar horários:', error);
            showAlert('error', 'Erro ao carregar horários disponíveis');
        });
}

function carregarMeusAgendamentos() {
    console.log('Carregando agendamentos para o usuário:', currentUser ? currentUser.uid : 'N/A');
    
    if (!currentUser) {
        elements.agendamentosList.innerHTML = '<p class="empty-message">Faça login para ver seus agendamentos</p>';
        return;
    }
    
    elements.agendamentosList.innerHTML = '<p class="empty-message">Carregando agendamentos...</p>';
    
    db.collection('agendamentos')
        .where('userId', '==', currentUser.uid)
        .orderBy('data', 'desc')
        .orderBy('hora')
        .get()
        .then(querySnapshot => {
            console.log('Número de agendamentos encontrados:', querySnapshot.size);
            
            if (querySnapshot.empty) {
                elements.agendamentosList.innerHTML = '<p class="empty-message">Você não possui agendamentos. <a href="#agendar">Agende agora!</a></p>';
                return;
            }
            
            elements.agendamentosList.innerHTML = '';
            
            querySnapshot.forEach(doc => {
                const agendamento = doc.data();
                const agendamentoCard = document.createElement('div');
                agendamentoCard.className = 'agendamento-card';
                agendamentoCard.innerHTML = `
                    <div class="agendamento-info">
                        <h3>${agendamento.servico}${agendamento.preco ? ` - R$ ${agendamento.preco}` : ''}</h3>
                        <p><strong>Profissional:</strong> ${agendamento.barbeiro}</p>
                        <p><strong>Data:</strong> ${formatarData(agendamento.data)} às ${agendamento.hora}</p>
                        ${agendamento.observacoes ? `<p><strong>Observações:</strong> ${agendamento.observacoes}</p>` : ''}
                        <p><strong>Status:</strong> <span class="status-${agendamento.status}">${agendamento.status}</span></p>
                    </div>
                    <div class="agendamento-actions">
                        ${agendamento.status === 'confirmado' ? `<button class="btn danger-btn" onclick="cancelarAgendamento('${doc.id}')">Cancelar</button>` : ''}
                    </div>
                `;
                elements.agendamentosList.appendChild(agendamentoCard);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar agendamentos:', error);
            elements.agendamentosList.innerHTML = '<p class="empty-message">Erro ao carregar agendamentos. Tente novamente.</p>';
            
            // Verifica se é erro de índice faltante
            if (error.code === 'failed-precondition') {
                showAlert('error', 'Estamos atualizando o sistema. Tente novamente em alguns instantes.');
            }
        });
}

function cancelarAgendamento(agendamentoId) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        db.collection('agendamentos').doc(agendamentoId).update({
            status: 'cancelado'
        })
        .then(() => {
            showAlert('success', 'Agendamento cancelado com sucesso');
            carregarMeusAgendamentos();
        })
        .catch(error => {
            showAlert('error', 'Erro ao cancelar agendamento: ' + error.message);
        });
    }
}

// Dashboard functions
function carregarDashboard() {
    if (!currentUser) return;
    
    db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            const userData = doc.data();
            const isAdmin = userData && (userData.isAdmin || userData.email === ADMIN_EMAIL);
            
            if (!isAdmin) {
                showAlert('error', 'Acesso restrito a administradores');
                navigateTo('home');
                return;
            }
            
            // Carrega todos os agendamentos para o admin
            db.collection('agendamentos')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.empty) {
                        elements.ultimosAgendamentos.innerHTML = '<tr><td colspan="5">Nenhum agendamento recente</td></tr>';
                        return;
                    }
                    
                    elements.ultimosAgendamentos.innerHTML = '';
                    
                    querySnapshot.forEach(doc => {
                        const agendamento = doc.data();
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${agendamento.userEmail || 'N/A'}</td>
                            <td>${agendamento.servico}</td>
                            <td>${agendamento.barbeiro}</td>
                            <td>${formatarData(agendamento.data)}</td>
                            <td>${agendamento.hora}</td>
                        `;
                        elements.ultimosAgendamentos.appendChild(row);
                    });
                });
            
            carregarAgendamentosHoje();
            carregarAgendamentosSemana();
            carregarGraficoServicos();
            carregarGraficoAgendamentos();
        })
        .catch(error => {
            console.error('Erro ao verificar permissões:', error);
        });
}

function carregarAgendamentosHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    
    db.collection('agendamentos')
        .where('data', '==', hoje)
        .where('status', '==', 'confirmado')
        .get()
        .then(querySnapshot => {
            elements.agendamentosHoje.textContent = querySnapshot.size;
        })
        .catch(error => {
            console.error('Erro ao carregar agendamentos de hoje:', error);
        });
}

function carregarAgendamentosSemana() {
    const hoje = new Date();
    const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
    const fimSemana = new Date(hoje.setDate(hoje.getDate() + 6));
    
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];
    const fimSemanaStr = fimSemana.toISOString().split('T')[0];
    
    db.collection('agendamentos')
        .where('data', '>=', inicioSemanaStr)
        .where('data', '<=', fimSemanaStr)
        .where('status', '==', 'confirmado')
        .get()
        .then(querySnapshot => {
            elements.agendamentosSemana.textContent = querySnapshot.size;
        })
        .catch(error => {
            console.error('Erro ao carregar agendamentos da semana:', error);
        });
}

function carregarGraficoServicos() {
    db.collection('agendamentos')
        .where('status', '==', 'confirmado')
        .get()
        .then(querySnapshot => {
            const servicosCount = {};
            
            querySnapshot.forEach(doc => {
                const servico = doc.data().servico;
                servicosCount[servico] = (servicosCount[servico] || 0) + 1;
            });
            
            const servicos = Object.keys(servicosCount);
            const quantidades = Object.values(servicosCount);
            
            const backgroundColors = [
                'rgba(109, 74, 255, 0.7)',
                'rgba(255, 107, 107, 0.7)',
                'rgba(40, 167, 69, 0.7)',
                'rgba(255, 193, 7, 0.7)',
                'rgba(23, 162, 184, 0.7)',
                'rgba(108, 117, 125, 0.7)'
            ];
            
            const ctx = document.getElementById('servicos-chart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: servicos,
                    datasets: [{
                        label: 'Serviços Mais Populares',
                        data: quantidades,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar gráfico de serviços:', error);
        });
}

function carregarGraficoAgendamentos() {
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 5);
    seisMesesAtras.setDate(1);
    
    db.collection('agendamentos')
        .where('createdAt', '>=', seisMesesAtras)
        .where('status', '==', 'confirmado')
        .get()
        .then(querySnapshot => {
            const agendamentosPorMes = {};
            const meses = [];
            const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            
            for (let i = 0; i < 6; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const nomeMes = nomesMeses[date.getMonth()];
                agendamentosPorMes[mesAno] = 0;
                meses.unshift(`${nomeMes}/${date.getFullYear()}`);
            }
            
            querySnapshot.forEach(doc => {
                const data = doc.data().createdAt.toDate();
                const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
                
                if (agendamentosPorMes[mesAno] !== undefined) {
                    agendamentosPorMes[mesAno]++;
                }
            });
            
            const quantidades = Object.values(agendamentosPorMes);
            
            const ctx = document.getElementById('agendamentos-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: meses,
                    datasets: [{
                        label: 'Agendamentos por Mês',
                        data: quantidades,
                        backgroundColor: 'rgba(109, 74, 255, 0.2)',
                        borderColor: 'rgba(109, 74, 255, 1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true,
                        pointBackgroundColor: 'rgba(109, 74, 255, 1)',
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar gráfico de agendamentos:', error);
        });
}

// Utility functions
function formatarData(dataStr) {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dataStr).toLocaleDateString('pt-BR', options);
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    alert.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
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
            document.querySelectorAll('.modal').forEach(modal => hideModal(modal));
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
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });

    // Phone number mask
    elements.registerPhone.addEventListener('input', function(e) {
        const value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';
        
        if (value.length > 0) formattedValue = '(' + value.substring(0, 2);
        if (value.length > 2) formattedValue += ') ' + value.substring(2, 7);
        if (value.length > 7) formattedValue += '-' + value.substring(7, 11);
        
        e.target.value = formattedValue;
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    const today = new Date().toISOString().split('T')[0];
    elements.dataInput.setAttribute('min', today);
    
    if (window.location.hash) {
        navigateTo(window.location.hash.substring(1));
    } else {
        navigateTo('home');
    }
});
