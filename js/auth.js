// Configuração do Supabase
const SUPABASE_URL = 'https://cokcagwnzfxhkxrsdhhs.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNva2NhZ3duemZ4aGt4cnNkaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTkzOTgsImV4cCI6MjA2MjM3NTM5OH0.Te2eX6djMPJSbHwGJ_oA9y60ntcJsLyzDq1SAybzfgg'; 

// Inicializar o cliente Supabase
let supabaseAuth;
try {
    if (typeof supabase !== 'undefined') {
        const { createClient } = supabase;
        supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase Auth Client Initialized');
    } else {
        console.error('Biblioteca Supabase não encontrada. Verifique se o script foi carregado corretamente.');
    }
} catch (error) {
    console.error('Erro ao inicializar Supabase Auth:', error);
}

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o usuário já está logado
    checkAuthState();
    
    // Configurar formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Configurar botão e modal de registro
    const registerButton = document.getElementById('registerButton');
    const registerModal = document.getElementById('registerModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    
    if (registerButton && registerModal) {
        registerButton.addEventListener('click', () => {
            registerModal.classList.remove('hidden');
        });
    }
    
    if (closeRegisterModal && registerModal) {
        closeRegisterModal.addEventListener('click', () => {
            registerModal.classList.add('hidden');
        });
        
        // Fechar modal ao clicar fora
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) {
                registerModal.classList.add('hidden');
            }
        });
    }
    
    // Configurar formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

/**
 * Verifica o estado de autenticação do usuário
 */
async function checkAuthState() {
    try {
        const { data: { user } } = await supabaseAuth.auth.getUser();
        
        // Se estamos na página de login e o usuário está autenticado, redirecionar para a página principal
        if (user && window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // Se não estamos na página de login e o usuário não está autenticado, redirecionar para login
        if (!user && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Em caso de erro, é mais seguro redirecionar para login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

/**
 * Processa o login do usuário
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    try {
        const { data, error } = await supabaseAuth.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            errorElement.textContent = 'Erro ao fazer login: ' + error.message;
            errorElement.classList.remove('hidden');
            return;
        }
        
        // Login bem-sucedido, redirecionar para a página principal
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro ao processar login:', error);
        errorElement.textContent = 'Ocorreu um erro ao processar o login. Tente novamente.';
        errorElement.classList.remove('hidden');
    }
}

/**
 * Processa o registro de um novo usuário
 */
async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorElement = document.getElementById('registerError');
    
    // Validação básica
    if (password.length < 6) {
        errorElement.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        errorElement.classList.remove('hidden');
        return;
    }
    
    try {
        const { data, error } = await supabaseAuth.auth.signUp({
            email,
            password
        });
        
        if (error) {
            errorElement.textContent = 'Erro ao criar conta: ' + error.message;
            errorElement.classList.remove('hidden');
            return;
        }
        
        // Registro bem-sucedido
        alert('Conta criada com sucesso! Você já pode fazer login.');
        document.getElementById('registerModal').classList.add('hidden');
        
        // Limpar formulário
        document.getElementById('registerForm').reset();
    } catch (error) {
        console.error('Erro ao processar registro:', error);
        errorElement.textContent = 'Ocorreu um erro ao processar o registro. Tente novamente.';
        errorElement.classList.remove('hidden');
    }
}

/**
 * Realiza o logout do usuário
 */
async function logout() {
    try {
        const { error } = await supabaseAuth.auth.signOut();
        
        if (error) {
            console.error('Erro ao fazer logout:', error);
            return;
        }
        
        // Redirecionar para a página de login
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro ao processar logout:', error);
    }
}

// Expor a função de logout globalmente
window.logout = logout;