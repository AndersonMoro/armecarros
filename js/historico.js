// Arquivo para gerenciar a exibição do histórico de veículos

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Página de histórico inicializada');
    
    // Verificar se o usuário está autenticado
    try {
        if (_supabase) {
            const { data: { user } } = await _supabase.auth.getUser();
            if (!user) {
                console.error('Usuário não autenticado');
                window.location.href = 'login.html';
                return;
            }
            console.log('Usuário autenticado:', user.email);
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        window.location.href = 'login.html';
        return;
    }
    
    // Carregar e exibir os veículos
    loadVehicles();
});

/**
 * Carrega e exibe os veículos do banco de dados
 */
async function loadVehicles() {
    try {
        console.log('Carregando veículos...');
        const vehicles = await vehicleStorage.getAllVehicles();
        console.log('Veículos carregados:', vehicles);
        
        const vehiclesList = document.getElementById('vehiclesList');
        
        // Limpar a mensagem de carregamento
        vehiclesList.innerHTML = '';
        
        if (vehicles.length === 0) {
            vehiclesList.innerHTML = '<p class="text-center text-gray-500">Nenhum veículo registrado ainda.</p>';
            return;
        }
        
        // Obter o template
        const template = document.getElementById('vehicleItemTemplate');
        
        // Adicionar cada veículo à lista
        vehicles.forEach(vehicle => {
            // Clonar o template
            const vehicleItem = document.importNode(template.content, true);
            
            // Preencher os dados
            vehicleItem.querySelector('.vehicle-plate').textContent = vehicle.plate;
            
            // Formatar a data
            const date = new Date(vehicle.timestamp);
            const formattedDate = date.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            vehicleItem.querySelector('.vehicle-date').textContent = formattedDate;
            
            // Preencher as fotos
            if (vehicle.photos) {
                const leftPhoto = vehicleItem.querySelector('.vehicle-photo-left');
                const rightPhoto = vehicleItem.querySelector('.vehicle-photo-right');
                const frontPhoto = vehicleItem.querySelector('.vehicle-photo-front');
                const backPhoto = vehicleItem.querySelector('.vehicle-photo-back');
                
                if (vehicle.photos.leftSide) leftPhoto.src = vehicle.photos.leftSide;
                if (vehicle.photos.rightSide) rightPhoto.src = vehicle.photos.rightSide;
                if (vehicle.photos.front) frontPhoto.src = vehicle.photos.front;
                if (vehicle.photos.back) backPhoto.src = vehicle.photos.back;
            }
            
            // Preencher os danos
            const damagesList = vehicleItem.querySelector('.vehicle-damages');
            if (vehicle.damages && vehicle.damages.length > 0) {
                const damageLabels = {
                    'scratch': 'Arranhado na lateral',
                    'bumper': 'Batida no para-choque',
                    'glass': 'Vidro trincado',
                    'dent': 'Amassado'
                };
                
                vehicle.damages.forEach(damage => {
                    const li = document.createElement('li');
                    li.textContent = damageLabels[damage] || damage;
                    damagesList.appendChild(li);
                });
            } else {
                damagesList.innerHTML = '<li>Nenhum dano registrado</li>';
            }
            
            // Preencher as observações
            const notesElement = vehicleItem.querySelector('.vehicle-notes');
            notesElement.textContent = vehicle.notes || 'Nenhuma observação';
            
            // Configurar o botão de detalhes
            const toggleButton = vehicleItem.querySelector('.toggle-details');
            const detailsSection = vehicleItem.querySelector('.vehicle-details');
            
            toggleButton.addEventListener('click', function() {
                const isHidden = detailsSection.classList.contains('hidden');
                
                if (isHidden) {
                    detailsSection.classList.remove('hidden');
                    toggleButton.textContent = 'Ocultar';
                } else {
                    detailsSection.classList.add('hidden');
                    toggleButton.textContent = 'Detalhes';
                }
            });
            
            // Adicionar o item à lista
            vehiclesList.appendChild(vehicleItem);
        });
        
    } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        document.getElementById('vehiclesList').innerHTML = 
            '<p class="text-center text-red-500">Erro ao carregar veículos. Por favor, tente novamente.</p>';
    }
}