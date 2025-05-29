
/**
 * Gerencia o carregamento e fallback do logo usando Supabase Storage
 */
document.addEventListener('DOMContentLoaded', function() {
    const logoImages = document.querySelectorAll('img[alt="ARMeCarros Logo"]');
    
    logoImages.forEach(img => {
        loadLogoFromSupabase(img);
    });
});

/**
 * Carrega o logo do Supabase Storage
 */
async function loadLogoFromSupabase(imgElement) {
    try {
        // Verificar se o Supabase está disponível
        if (typeof window._supabase === 'undefined') {
            console.warn('Supabase não disponível, tentando caminhos locais');
            tryLocalPaths(imgElement);
            return;
        }

        const _supabase = window._supabase;
        
        // Tentar obter a URL pública do logo do Supabase Storage
        const { data } = _supabase
            .storage
            .from('app-assets')
            .getPublicUrl('logo/ARMeCarros_novo_logo.png');

        if (data && data.publicUrl) {
            console.log('Carregando logo do Supabase:', data.publicUrl);
            imgElement.src = data.publicUrl;
            
            // Se ainda falhar, tentar caminhos locais
            imgElement.onerror = function() {
                console.warn('Logo do Supabase falhou, tentando caminhos locais');
                tryLocalPaths(imgElement);
            };
        } else {
            console.warn('URL do logo não encontrada no Supabase, tentando caminhos locais');
            tryLocalPaths(imgElement);
        }
    } catch (error) {
        console.error('Erro ao carregar logo do Supabase:', error);
        tryLocalPaths(imgElement);
    }
}

/**
 * Tenta carregar o logo de caminhos locais como fallback
 */
function tryLocalPaths(imgElement) {
    const logoPaths = [
        'attached_assets/ARMeCarros_novo_logo.png',
        './attached_assets/ARMeCarros_novo_logo.png',
        'attached_assets/ARMeCarros_logo_estilo2025.png',
        './attached_assets/ARMeCarros_logo_estilo2025.png'
    ];
    
    let currentPathIndex = 0;
    
    function tryNextPath() {
        if (currentPathIndex < logoPaths.length) {
            imgElement.src = logoPaths[currentPathIndex];
            currentPathIndex++;
        } else {
            // Se todos os caminhos falharam, usar fallback
            handleLogoError(imgElement);
        }
    }
    
    // Remover listeners existentes para evitar duplicação
    imgElement.removeEventListener('error', tryNextPath);
    imgElement.addEventListener('error', tryNextPath);
    
    // Começar tentando o primeiro caminho
    tryNextPath();
}

/**
 * Aplica fallback visual quando o logo não pode ser carregado
 */
function handleLogoError(imgElement) {
    console.warn('Logo não pôde ser carregado, aplicando fallback');
    
    const container = imgElement.parentNode;
    
    // Remover a imagem que falhou
    imgElement.remove();
    
    // Criar elemento de fallback se não existir
    if (!container.querySelector('.logo-fallback')) {
        const fallback = document.createElement('div');
        fallback.className = 'logo-fallback';
        fallback.innerHTML = '🚗';
        fallback.style.cssText = `
            font-size: 48px;
            text-align: center;
            line-height: 80px;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #059669;
            border: 2px solid #059669;
            border-radius: 8px;
            background-color: #f0fdf4;
        `;
        
        container.appendChild(fallback);
    }
}

/**
 * Função utilitária para fazer upload do logo para o Supabase Storage
 * Esta função pode ser chamada manualmente no console para fazer o upload inicial
 */
window.uploadLogoToSupabase = async function() {
    try {
        if (typeof window._supabase === 'undefined') {
            console.error('Supabase não está disponível');
            return;
        }

        const _supabase = window._supabase;
        
        // Buscar a imagem local
        const response = await fetch('attached_assets/ARMeCarros_novo_logo.png');
        const blob = await response.blob();
        
        // Fazer upload para o Supabase Storage
        const { data, error } = await _supabase
            .storage
            .from('app-assets')
            .upload('logo/ARMeCarros_novo_logo.png', blob, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Erro ao fazer upload do logo:', error);
            return;
        }

        console.log('Logo enviado com sucesso para o Supabase:', data);
        
        // Recarregar a página para ver o novo logo
        window.location.reload();
    } catch (error) {
        console.error('Erro ao processar upload do logo:', error);
    }
};
