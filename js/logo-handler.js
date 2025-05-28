
/**
 * Gerencia o carregamento e fallback do logo
 */
document.addEventListener('DOMContentLoaded', function() {
    const logoImages = document.querySelectorAll('img[alt="ARMeCarros Logo"]');
    
    logoImages.forEach(img => {
        img.addEventListener('error', function() {
            console.warn('Logo não pôde ser carregado, aplicando fallback');
            
            // Criar um elemento de fallback
            const fallback = document.createElement('div');
            fallback.innerHTML = '🚗';
            fallback.style.fontSize = '48px';
            fallback.style.textAlign = 'center';
            fallback.style.lineHeight = '80px';
            fallback.style.width = '80px';
            fallback.style.height = '80px';
            
            // Substituir a imagem pelo fallback
            this.parentNode.replaceChild(fallback, this);
        });
        
        // Forçar reload da imagem
        if (img.src) {
            const originalSrc = img.src;
            img.src = '';
            img.src = originalSrc + '?t=' + Date.now();
        }
    });
});
