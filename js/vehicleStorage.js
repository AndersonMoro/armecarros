// Configuração do Supabase
// Removendo a declaração duplicada das constantes
// const SUPABASE_URL = 'https://cokcagwnzfxhkxrsdhhs.supabase.co'; 
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNva2NhZ3duemZ4aGt4cnNkaGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTkzOTgsImV4cCI6MjA2MjM3NTM5OH0.Te2eX6djMPJSbHwGJ_oA9y60ntcJsLyzDq1SAybzfgg'; 

// Inicializar o cliente Supabase usando as constantes já declaradas em auth.js
// Usar a instância global do Supabase se já existir
let _supabase;
try {
    if (typeof window._supabase !== 'undefined') {
        _supabase = window._supabase;
        console.log('Usando Supabase Client global:', _supabase);
    } else if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window._supabase = _supabase;
        console.log('Supabase Client Initialized:', _supabase);

        // Verificar autenticação
        _supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' && !window.location.pathname.includes('login.html')) {
                // Redirecionar para login se o usuário for desconectado
                window.location.href = 'login.html';
            }
        });
    } else {
        console.error('Biblioteca Supabase não encontrada. Verifique se o script foi carregado corretamente.');
        // Fallback para localStorage temporariamente
        _supabase = null;
    }
} catch (error) {
    console.error('Erro ao inicializar Supabase:', error);
    _supabase = null;
}

const vehicleStorage = {
    /**
     * Faz upload de uma imagem para o Supabase Storage
     * @param {string} base64Image - Imagem em formato base64
     * @param {string} fileName - Nome do arquivo
     * @returns {Promise<string>} URL da imagem
     */
    async uploadImage(base64Image, fileName) {
        try {
            const _supabase = getSupabaseClient();
            if (!_supabase) {
                console.error('Supabase não está disponível para upload de imagem');
                return null;
            }

            // Remover o prefixo "data:image/jpeg;base64," da string base64
            const base64Data = base64Image.split(',')[1];

            // Converter base64 para Blob
            const byteCharacters = atob(base64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);

                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, {type: 'image/jpeg'});
            const file = new File([blob], fileName, {type: 'image/jpeg'});

            // Obter o usuário atual para criar uma pasta específica
            const { data: { user } } = await _supabase.auth.getUser();
            const userId = user ? user.id : 'anonymous';
            const timestamp = new Date().getTime();
            const filePath = `vehicles/${userId}/${timestamp}_${fileName}`;

            // Fazer upload para o Supabase Storage
            const { data, error } = await _supabase
                .storage
                .from('vehicle-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Erro ao fazer upload da imagem:', error);
                return null;
            }

            // Obter a URL pública da imagem
            const { data: { publicUrl } } = _supabase
                .storage
                .from('vehicle-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Falha ao fazer upload da imagem:', error);
            return null;
        }
    },

    /**
     * Salva os dados de um veículo no Supabase ou localStorage (fallback).
     */
    async saveVehicle(vehicleData) {
        try {
            // Verificar se o usuário está autenticado
            const _supabase = getSupabaseClient();
            const { data: { user } } = await _supabase.auth.getUser();

            console.log('Usuário autenticado:', user);

            if (!user && _supabase) {
                console.error('Usuário não autenticado');
                window.location.href = 'login.html';
                return null;
            }

            // Fazer upload das imagens e obter URLs
            let photoUrls = null;

            if (_supabase && vehicleData.photos) {
                photoUrls = {
                    leftSide: await this.uploadImage(vehicleData.photos.leftSide, 'left-side.jpg'),
                    rightSide: await this.uploadImage(vehicleData.photos.rightSide, 'right-side.jpg'),
                    front: await this.uploadImage(vehicleData.photos.front, 'front.jpg'),
                    back: await this.uploadImage(vehicleData.photos.back, 'back.jpg')
                };

                console.log('URLs das fotos após upload:', photoUrls);
            }

            // Adiciona um timestamp do momento do salvamento, se não existir
            const dataToSave = {
                plate: vehicleData.plate,
                damages: vehicleData.damages,
                notes: vehicleData.notes,
                photos: photoUrls, // Descomentando esta linha para salvar as URLs das fotos
                timestamp: vehicleData.timestamp || new Date().toISOString(),
                user_id: user ? user.id : null // Adicionar ID do usuário
            };

            console.log('Tentando salvar veículo com dados:', dataToSave);

            // Se o Supabase estiver disponível, use-o
            if (_supabase) {
                const { data, error } = await _supabase
                    .from('vehicles')
                    .insert([dataToSave])
                    .select();

                if (error) {
                    console.error('Erro ao salvar veículo no Supabase:', error);
                    throw error;
                }

                console.log('Veículo salvo no Supabase:', data);
                return data[0];
            } else {
                // Fallback para localStorage
                console.warn('Usando localStorage como fallback para salvar o veículo');
                const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
                const newVehicle = { ...dataToSave, id: Date.now().toString() };
                vehicles.push(newVehicle);
                localStorage.setItem('vehicles', JSON.stringify(vehicles));
                return newVehicle;
            }
        } catch (error) {
            console.error('Falha ao salvar veículo:', error);
            // Adicionar mais detalhes sobre o erro
            if (error.message) {
                console.error('Mensagem de erro:', error.message);
            }
            if (error.details) {
                console.error('Detalhes do erro:', error.details);
            }
            return null;
        }
    },

    /**
     * Obtém todos os veículos registrados hoje.
     */
    async getTodayVehicles() {
        try {
            // Verificar se o usuário está autenticado
            const _supabase = getSupabaseClient();
            const { data: { user } } = await _supabase.auth.getUser();
            if (!user && _supabase) {
                console.error('Usuário não autenticado');
                window.location.href = 'login.html';
                return [];
            }

            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, -1).toISOString();

            // Se o Supabase estiver disponível, use-o
            if (_supabase) {
                const { data, error } = await _supabase
                    .from('vehicles')
                    .select('*')
                    .gte('timestamp', startOfDay)
                    .lte('timestamp', endOfDay)
                    .order('timestamp', { ascending: false });

                if (error) {
                    console.error('Erro ao buscar veículos de hoje no Supabase:', error);
                    throw error;
                }
                console.log('Veículos de hoje do Supabase:', data);
                return data || [];
            } else {
                // Fallback para localStorage
                console.warn('Usando localStorage como fallback para buscar veículos');
                const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
                return vehicles.filter(vehicle => {
                    const vehicleDate = new Date(vehicle.timestamp);
                    return vehicleDate >= new Date(startOfDay) && vehicleDate <= new Date(endOfDay);
                }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }
        } catch (error) {
            console.error('Falha ao buscar veículos de hoje:', error);
            return [];
        }
    },

    /**
     * Obtém todos os veículos.
     */
    async getAllVehicles() {
        try {
            // Verificar se o usuário está autenticado
            const _supabase = getSupabaseClient();
            const { data: { user } } = await _supabase.auth.getUser();
            if (!user && _supabase) {
                console.error('Usuário não autenticado');
                window.location.href = 'login.html';
                return [];
            }

            if (_supabase) {
                const { data, error } = await _supabase
                    .from('vehicles')
                    .select('*')
                    .order('timestamp', { ascending: false });

                if (error) {
                    console.error('Erro ao buscar todos os veículos no Supabase:', error);
                    throw error;
                }
                return data || [];
            } else {
                // Fallback para localStorage
                const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
                return vehicles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            }
        } catch (error) {
            console.error('Falha ao buscar todos os veículos:', error);
            return [];
        }
    }
};

// Para garantir que vehicleStorage esteja disponível globalmente
window.vehicleStorage = vehicleStorage;