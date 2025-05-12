/**
 * Lógica principal do aplicativo
 */
document.addEventListener('DOMContentLoaded', function() {
    const vehicleForm = document.getElementById('vehicleForm');
    
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleFormSubmit);
    }
    
    /**
     * Processa o envio do formulário
     */
    async function handleFormSubmit(event) { // 1. Tornar a função async
        event.preventDefault();
        
        // Validar se todas as fotos foram adicionadas
        const requiredPhotos = ['leftSidePreview', 'rightSidePreview', 'frontPreview', 'backPreview'];
        const missingPhotos = requiredPhotos.filter(id => {
            const preview = document.getElementById(id);
            return preview.classList.contains('hidden');
        });
        
        if (missingPhotos.length > 0) {
            alert('Por favor, adicione todas as fotos obrigatórias do veículo.');
            return;
        }
        
        // Coletar dados do formulário
        const plate = document.getElementById('plate').value.toUpperCase();
        const notes = document.getElementById('notes').value;
        
        // Coletar danos selecionados
        const damageCheckboxes = document.querySelectorAll('input[name="damages"]:checked');
        const damages = Array.from(damageCheckboxes).map(checkbox => checkbox.value);
        
        // Coletar fotos (ainda como base64)
        const photos = {
            leftSide: document.getElementById('leftSidePreview').src,
            rightSide: document.getElementById('rightSidePreview').src,
            front: document.getElementById('frontPreview').src,
            back: document.getElementById('backPreview').src
        };
        
        // Criar objeto com dados do veículo
        const vehicleData = {
            plate,
            photos,
            damages,
            notes
            // O timestamp será adicionado pela função saveVehicle em vehicleStorage.js
        };
        
        // Salvar os dados
        try {
            const savedVehicle = await vehicleStorage.saveVehicle(vehicleData); // 2. Usar await
        
            if (savedVehicle) { // 3. Verificar se o veículo foi salvo (saveVehicle retorna null em caso de erro interno)
                // Mostrar mensagem de sucesso
                showSuccessMessage();
                
                // Limpar o formulário após 1.5 segundos
                setTimeout(() => {
                    resetForm();
                }, 1500);
            } else {
                // Este caso pode ocorrer se saveVehicle capturar um erro e retornar null
                alert('Falha ao salvar o veículo. Verifique o console do navegador para mais detalhes.');
                console.error('saveVehicle retornou null, indicando uma falha interna em vehicleStorage.js');
            }
            
        } catch (error) { // Este catch agora lidará com erros propagados de saveVehicle (ex: erros da API do Supabase)
            console.error('Erro ao salvar veículo (capturado em app.js):', error);
            alert('Ocorreu um erro ao salvar os dados do veículo. Por favor, tente novamente e verifique o console.');
        }
    }
    
    /**
     * Exibe mensagem de sucesso
     */
    function showSuccessMessage() {
        // Criar elemento de mensagem
        const messageEl = document.createElement('div');
        messageEl.className = 'fixed top-0 left-0 right-0 bg-green-500 text-white text-center py-4 text-xl font-bold fade-in';
        messageEl.textContent = 'Veículo registrado com sucesso!';
        
        // Adicionar ao corpo do documento
        document.body.appendChild(messageEl);
        
        // Remover após 3 segundos
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
    
    /**
     * Limpa o formulário
     */
    function resetForm() {
        vehicleForm.reset();
        
        // Limpar previews de imagens
        const previews = document.querySelectorAll('.preview-image');
        previews.forEach(preview => {
            preview.src = '';
            preview.classList.add('hidden');
        });
        
        // Mostrar botões de adicionar
        const addButtons = document.querySelectorAll('.photo-box button');
        addButtons.forEach(button => {
            button.classList.remove('hidden');
        });
        
        // Remover botões de remover foto
        const removeButtons = document.querySelectorAll('.remove-photo');
        removeButtons.forEach(button => {
            button.remove();
        });
        
        // Focar no campo de placa
        document.getElementById('plate').focus();
    }
});