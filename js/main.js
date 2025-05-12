// Arquivo main.js - Inicialização e configuração da aplicação principal

document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicação ARMeCarros inicializada');
    
    // Configurar o formulário de registro de veículos
    const vehicleForm = document.getElementById('vehicleForm');
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Configurar os inputs de foto
    setupPhotoInputs();
});

// Configurar os inputs de foto para mostrar previews
function setupPhotoInputs() {
    const photoInputs = {
        'leftSideInput': 'leftSidePreview',
        'rightSideInput': 'rightSidePreview',
        'frontInput': 'frontPreview',
        'backInput': 'backPreview'
    };
    
    for (const [inputId, previewId] of Object.entries(photoInputs)) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        
        if (input && preview) {
            input.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                        preview.classList.remove('hidden');
                        preview.parentElement.querySelector('button').classList.add('hidden');
                    };
                    
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
    }
}

// Processar o envio do formulário
async function handleFormSubmit(event) {
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
    
    // Coletar fotos (como base64)
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
    };
    
    // Salvar os dados
    try {
        const savedVehicle = await vehicleStorage.saveVehicle(vehicleData);
        
        if (savedVehicle) {
            // Mostrar mensagem de sucesso
            showSuccessMessage();
            
            // Limpar o formulário após 1.5 segundos
            setTimeout(() => {
                resetForm();
            }, 1500);
        } else {
            alert('Falha ao salvar o veículo. Verifique o console do navegador para mais detalhes.');
        }
    } catch (error) {
        console.error('Erro ao salvar veículo:', error);
        alert('Ocorreu um erro ao salvar os dados do veículo. Por favor, tente novamente.');
    }
}

// Mostrar mensagem de sucesso
function showSuccessMessage() {
    const form = document.getElementById('vehicleForm');
    
    // Criar elemento de mensagem
    const message = document.createElement('div');
    message.className = 'fixed top-0 left-0 w-full bg-green-500 text-white text-center py-4 text-xl font-bold';
    message.textContent = 'Veículo registrado com sucesso!';
    
    // Adicionar ao corpo do documento
    document.body.appendChild(message);
    
    // Remover após 1.5 segundos
    setTimeout(() => {
        message.remove();
    }, 1500);
}

// Resetar o formulário
function resetForm() {
    document.getElementById('vehicleForm').reset();
    
    // Resetar previews de imagens
    const previews = document.querySelectorAll('.preview-image');
    previews.forEach(preview => {
        preview.classList.add('hidden');
        preview.parentElement.querySelector('button').classList.remove('hidden');
    });
    
    // Limpar checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}