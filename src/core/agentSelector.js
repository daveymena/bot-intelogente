// Import agents
const salesAgent = require('../agents/salesAgent');
const supportAgent = require('../agents/supportAgent');
const technicalAgent = require('../agents/technicalAgent');
const adminAgent = require('../agents/adminAgent');

const intentMap = {
    'consulta_precio': salesAgent,
    'compra': salesAgent,
    'objecion_precio': salesAgent,
    'soporte': supportAgent,
    'reclamo': supportAgent,
    'especificacion_tecnica': technicalAgent,
    'comparacion': technicalAgent,
    'facturacion': adminAgent,
    'saludo': salesAgent, // Maybe a generic one or Sales handles greetings for prospects
    'despedida': salesAgent
};

module.exports = {
    select(intent) {
        return intentMap[intent] || salesAgent; // Default to salesAgent
    }
};
