/**
 * Gerencia o armazenamento de dados do aplicativo
 */
class VehicleStorage {
    constructor() {
        this.storageKey = 'armecarros_vehicles';
    }
    
    /**
     * Salva um novo registro de veículo
     * @param {Object} vehicleData - Dados do veículo
     * @returns {String} ID do registro salvo
     */
    saveVehicle(vehicleData) {
        // Adicionar timestamp e ID único
        const timestamp = new Date().toISOString();
        const id = 'vehicle_' + Date.now();
        
        const vehicle = {
            id,
            timestamp,
            ...vehicleData
        };
        
        // Obter registros existentes
        const vehicles = this.getAllVehicles();
        
        // Adicionar novo registro
        vehicles.push(vehicle);
        
        // Salvar no localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(vehicles));
        
        return id;
    }
    
    /**
     * Obtém todos os registros de veículos
     * @returns {Array} Lista de veículos
     */
    getAllVehicles() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }
    
    /**
     * Obtém veículos registrados hoje
     * @returns {Array} Lista de veículos de hoje
     */
    getTodayVehicles() {
        const today = new Date().toISOString().split('T')[0];
        return this.getAllVehicles().filter(vehicle => {
            return vehicle.timestamp.startsWith(today);
        });
    }
    
    /**
     * Obtém um veículo pelo ID
     * @param {String} id - ID do veículo
     * @returns {Object|null} Dados do veículo ou null se não encontrado
     */
    getVehicleById(id) {
        return this.getAllVehicles().find(vehicle => vehicle.id === id) || null;
    }
    
    /**
     * Limpa todos os dados de veículos
     */
    clearAllData() {
        localStorage.removeItem(this.storageKey);
    }
}

// Criar instância global
const vehicleStorage = new VehicleStorage();