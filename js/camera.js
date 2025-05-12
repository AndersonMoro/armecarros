/**
 * Gerencia a captura e visualização de imagens
 */
document.addEventListener('DOMContentLoaded', function() {
    // Configuração para cada campo de foto
    const photoInputs = [
        { inputId: 'leftSideInput', previewId: 'leftSidePreview' },
        { inputId: 'rightSideInput', previewId: 'rightSidePreview' },
        { inputId: 'frontInput', previewId: 'frontPreview' },
        { inputId: 'backInput', previewId: 'backPreview' }
    ];

    // Configurar cada input de foto
    photoInputs.forEach(config => {
        const input = document.getElementById(config.inputId);
        const preview = document.getElementById(config.previewId);
        
        if (input && preview) {
            input.addEventListener('change', function(e) {
                handleImageUpload(e, preview);
            });
        }
    });

    // Função para processar o upload de imagem
    function handleImageUpload(event, previewElement) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Verificar se é uma imagem
        if (!file.type.match('image.*')) {
            alert('Por favor, selecione uma imagem válida.');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Exibir a imagem no elemento de preview
            previewElement.src = e.target.result;
            previewElement.classList.remove('hidden');
            
            // Esconder o botão de adicionar
            const parentBox = previewElement.parentElement;
            const addButton = parentBox.querySelector('button');
            if (addButton) {
                addButton.classList.add('hidden');
            }
            
            // Adicionar botão para remover a foto
            if (!parentBox.querySelector('.remove-photo')) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-photo absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center';
                removeBtn.innerHTML = '&times;';
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    previewElement.src = '';
                    previewElement.classList.add('hidden');
                    if (addButton) {
                        addButton.classList.remove('hidden');
                    }
                    this.remove();
                    // Limpar o input de arquivo
                    event.target.value = '';
                });
                parentBox.appendChild(removeBtn);
            }
        };
        
        reader.readAsDataURL(file);
    }
});