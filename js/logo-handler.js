
/**
 * Gerencia o carregamento e fallback do logo
 */
document.addEventListener('DOMContentLoaded', function() {
    const logoImages = document.querySelectorAll('img[alt="ARMeCarros Logo"]');
    
    logoImages.forEach(img => {
        // Tentar diferentes caminhos para o logo
        const logoPaths = [
            'attached_assets/ARMeCarros_novo_logo.png',
            './attached_assets/ARMeCarros_novo_logo.png',
            'attached_assets/ARMeCarros_logo_estilo2025.png',
            './attached_assets/ARMeCarros_logo_estilo2025.png'
        ];
        
        let currentPathIndex = 0;
        
        function tryNextPath() {
            if (currentPathIndex < logoPaths.length) {
                img.src = logoPaths[currentPathIndex];
                currentPathIndex++;
            } else {
                // Se todos os caminhos falharam, usar fallback
                handleLogoError.call(img);
            }
        }
        
        // Remover listeners existentes para evitar duplicação
        img.removeEventListener('error', tryNextPath);
        img.addEventListener('error', tryNextPath);
        
        // Começar tentando o primeiro caminho
        tryNextPath();
    });
    
    function handleLogoError() {
        console.warn('Logo não pôde ser carregado, aplicando fallback');
        
        const container = this.parentNode;
        
        // Remover a imagem que falhou
        this.remove();
        
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
            `;
            
            container.appendChild(fallback);
        }
    }
});
