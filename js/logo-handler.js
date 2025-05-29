
/**
 * Gerencia o carregamento e fallback do logo
 */
document.addEventListener('DOMContentLoaded', function() {
    const logoImages = document.querySelectorAll('img[alt="ARMeCarros Logo"]');
    
    logoImages.forEach(img => {
        // Remover listeners existentes para evitar duplicação
        img.removeEventListener('error', handleLogoError);
        img.addEventListener('error', handleLogoError);
        
        // Verificar se a imagem já carregou ou falhou
        if (img.complete && img.naturalHeight === 0) {
            handleLogoError.call(img);
        } else if (!img.complete) {
            // Tentar recarregar se ainda não terminou
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
