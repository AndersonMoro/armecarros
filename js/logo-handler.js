
/**
 * Gerencia o carregamento e fallback do logo
 */
document.addEventListener('DOMContentLoaded', function() {
    const logoImages = document.querySelectorAll('img[alt="ARMeCarros Logo"]');
    
    logoImages.forEach(img => {
        // Remover listeners existentes para evitar duplicação
        img.removeEventListener('error', handleLogoError);
        img.addEventListener('error', handleLogoError);
        
        // Tentar carregar a imagem imediatamente
        if (img.src && !img.complete) {
            // Adicionar timestamp para evitar cache
            const originalSrc = img.src.split('?')[0];
            img.src = originalSrc + '?t=' + Date.now();
        }
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
