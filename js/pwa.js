
// PWA Installation and Service Worker Registration

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('ServiceWorker registrado com sucesso: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker falhou: ', err);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;
const installButton = document.createElement('button');

window.addEventListener('beforeinstallprompt', (e) => {
  // Previne o prompt automático
  e.preventDefault();
  // Salva o evento para ser usado depois
  deferredPrompt = e;
  
  // Cria botão de instalação
  installButton.textContent = 'Instalar App';
  installButton.className = 'fixed bottom-20 right-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50';
  installButton.style.display = 'block';
  
  installButton.addEventListener('click', (e) => {
    // Esconde o botão
    installButton.style.display = 'none';
    // Mostra o prompt
    deferredPrompt.prompt();
    // Aguarda a escolha do usuário
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação do PWA');
      } else {
        console.log('Usuário recusou a instalação do PWA');
      }
      deferredPrompt = null;
    });
  });
  
  // Adiciona o botão à página
  document.body.appendChild(installButton);
});

// Esconde o botão se o app já estiver instalado
window.addEventListener('appinstalled', (evt) => {
  console.log('PWA foi instalado');
  if (installButton.style.display !== 'none') {
    installButton.style.display = 'none';
  }
});

// Detecta se está rodando como PWA
function isRunningStandalone() {
  return (window.matchMedia('(display-mode: standalone)').matches) || 
         (window.navigator.standalone) || 
         document.referrer.includes('android-app://');
}

// Adiciona classe especial se estiver rodando como PWA
if (isRunningStandalone()) {
  document.body.classList.add('pwa-mode');
  console.log('Aplicação rodando como PWA');
}

// Função para verificar status da rede
function updateOnlineStatus() {
  const statusIndicator = document.getElementById('network-status');
  
  if (!statusIndicator) {
    const indicator = document.createElement('div');
    indicator.id = 'network-status';
    indicator.className = 'fixed top-0 left-0 right-0 text-center py-1 text-sm z-50';
    document.body.appendChild(indicator);
  }
  
  const indicator = document.getElementById('network-status');
  
  if (navigator.onLine) {
    indicator.textContent = '';
    indicator.className = 'fixed top-0 left-0 right-0 text-center py-1 text-sm z-50';
  } else {
    indicator.textContent = 'Você está offline. Algumas funcionalidades podem estar limitadas.';
    indicator.className = 'fixed top-0 left-0 right-0 text-center py-1 text-sm z-50 bg-yellow-500 text-white';
  }
}

// Monitora mudanças no status da rede
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Verifica status inicial
updateOnlineStatus();
