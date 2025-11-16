"""
Intent Classifier - Clasificador de intenciones usando fastText
"""

import fasttext
import os
import logging
from typing import Dict, List, Tuple
import re
from unidecode import unidecode

logger = logging.getLogger(__name__)


class IntentClassifier:
    """
    Clasificador de intenciones ligero y rápido usando fastText
    
    Intenciones soportadas:
    - product_price: Preguntar precio de producto
    - product_availability: Consultar disponibilidad/stock
    - product_info: Información técnica de producto
    - product_compare: Comparar productos
    - product_recommend: Pedir recomendación
    - schedule_appointment: Agendar cita
    - reschedule_appointment: Reprogramar cita
    - cancel_appointment: Cancelar cita
    - order_status: Estado de pedido
    - payment_info: Información de pago
    - payment_confirm: Confirmar pago
    - credit_request: Solicitar fiado
    - credit_payment: Pagar fiado
    - complaint: Reclamo o queja
    - greeting: Saludo
    - farewell: Despedida
    - thanks: Agradecimiento
    - help: Pedir ayuda
    - other: Otro
    """
    
    def __init__(self, model_path: str = None):
        self.model_path = model_path or os.getenv("INTENT_MODEL_PATH", "/app/models/intent_ft.bin")
        self.model = None
        self.intents = [
            "product_price",
            "product_availability",
            "product_info",
            "product_compare",
            "product_recommend",
            "schedule_appointment",
            "reschedule_appointment",
            "cancel_appointment",
            "order_status",
            "payment_info",
            "payment_confirm",
            "credit_request",
            "credit_payment",
            "complaint",
            "greeting",
            "farewell",
            "thanks",
            "help",
            "other"
        ]
        
    async def load_model(self):
        """Carga el modelo fastText"""
        try:
            if os.path.exists(self.model_path):
                logger.info(f"Cargando modelo de intents desde {self.model_path}")
                self.model = fasttext.load_model(self.model_path)
                logger.info("✅ Modelo de intents cargado")
            else:
                logger.warning(f"⚠️ Modelo no encontrado en {self.model_path}, usando reglas por defecto")
                self.model = None
        except Exception as e:
            logger.error(f"Error cargando modelo: {e}")
            self.model = None
    
    def is_loaded(self) -> bool:
        """Verifica si el modelo está cargado"""
        return self.model is not None
    
    def preprocess(self, text: str) -> str:
        """Preprocesa el texto para clasificación"""
        # Lowercase
        text = text.lower()
        
        # Remove accents
        text = unidecode(text)
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Remove extra spaces
        text = ' '.join(text.split())
        
        return text
    
    async def predict(self, text: str, k: int = 3) -> Dict:
        """
        Predice la intención del texto
        
        Returns:
            {
                "intent": str,
                "confidence": float,
                "alternatives": List[Tuple[str, float]]
            }
        """
        
        # Preprocess
        processed_text = self.preprocess(text)
        
        if self.model:
            # Use fastText model
            try:
                labels, probs = self.model.predict(processed_text, k=k)
                
                # Clean labels (remove __label__ prefix)
                labels = [label.replace('__label__', '') for label in labels]
                
                # Create alternatives list
                alternatives = list(zip(labels, probs.tolist()))
                
                return {
                    "intent": labels[0],
                    "confidence": float(probs[0]),
                    "alternatives": alternatives
                }
            except Exception as e:
                logger.error(f"Error en predicción fastText: {e}")
                # Fallback to rules
                return self._predict_with_rules(text)
        else:
            # Use rule-based fallback
            return self._predict_with_rules(text)
    
    def _predict_with_rules(self, text: str) -> Dict:
        """Clasificación basada en reglas (fallback)"""
        
        text_lower = text.lower()
        
        # Greeting patterns
        if any(word in text_lower for word in ['hola', 'buenos', 'buenas', 'saludos', 'hey', 'ola']):
            return {"intent": "greeting", "confidence": 0.95, "alternatives": [("greeting", 0.95)]}
        
        # Farewell patterns
        if any(word in text_lower for word in ['adios', 'chao', 'hasta luego', 'nos vemos', 'bye']):
            return {"intent": "farewell", "confidence": 0.95, "alternatives": [("farewell", 0.95)]}
        
        # Thanks patterns
        if any(word in text_lower for word in ['gracias', 'muchas gracias', 'agradezco', 'thanks']):
            return {"intent": "thanks", "confidence": 0.95, "alternatives": [("thanks", 0.95)]}
        
        # Price patterns
        if any(word in text_lower for word in ['precio', 'cuesta', 'cuanto', 'valor', 'cuánto', 'vale']):
            return {"intent": "product_price", "confidence": 0.85, "alternatives": [("product_price", 0.85)]}
        
        # Availability patterns
        if any(word in text_lower for word in ['disponible', 'stock', 'hay', 'tienen', 'queda', 'disponibilidad']):
            return {"intent": "product_availability", "confidence": 0.85, "alternatives": [("product_availability", 0.85)]}
        
        # Appointment patterns
        if any(word in text_lower for word in ['cita', 'agendar', 'reservar', 'turno', 'horario']):
            if any(word in text_lower for word in ['cancelar', 'anular']):
                return {"intent": "cancel_appointment", "confidence": 0.85, "alternatives": [("cancel_appointment", 0.85)]}
            elif any(word in text_lower for word in ['cambiar', 'mover', 'reprogramar']):
                return {"intent": "reschedule_appointment", "confidence": 0.85, "alternatives": [("reschedule_appointment", 0.85)]}
            else:
                return {"intent": "schedule_appointment", "confidence": 0.85, "alternatives": [("schedule_appointment", 0.85)]}
        
        # Payment patterns
        if any(word in text_lower for word in ['pago', 'pagar', 'pagué', 'transferencia', 'consignación']):
            if any(word in text_lower for word in ['confirmé', 'realicé', 'hice', 'ya pagué']):
                return {"intent": "payment_confirm", "confidence": 0.85, "alternatives": [("payment_confirm", 0.85)]}
            else:
                return {"intent": "payment_info", "confidence": 0.80, "alternatives": [("payment_info", 0.80)]}
        
        # Credit/Fiado patterns
        if any(word in text_lower for word in ['fiado', 'crédito', 'credito', 'fiar', 'plazo']):
            return {"intent": "credit_request", "confidence": 0.85, "alternatives": [("credit_request", 0.85)]}
        
        # Complaint patterns
        if any(word in text_lower for word in ['reclamo', 'queja', 'problema', 'mal', 'defectuoso', 'no funciona']):
            return {"intent": "complaint", "confidence": 0.85, "alternatives": [("complaint", 0.85)]}
        
        # Recommendation patterns
        if any(word in text_lower for word in ['recomienda', 'recomendación', 'sugieres', 'mejor', 'cual']):
            return {"intent": "product_recommend", "confidence": 0.80, "alternatives": [("product_recommend", 0.80)]}
        
        # Compare patterns
        if any(word in text_lower for word in ['comparar', 'diferencia', 'versus', 'vs', 'mejor que']):
            return {"intent": "product_compare", "confidence": 0.80, "alternatives": [("product_compare", 0.80)]}
        
        # Help patterns
        if any(word in text_lower for word in ['ayuda', 'ayudar', 'ayúdame', 'help', 'auxilio']):
            return {"intent": "help", "confidence": 0.85, "alternatives": [("help", 0.85)]}
        
        # Default: product_info
        return {"intent": "product_info", "confidence": 0.60, "alternatives": [("product_info", 0.60), ("other", 0.40)]}
    
    async def get_stats(self) -> Dict:
        """Obtiene estadísticas del clasificador"""
        return {
            "model_loaded": self.is_loaded(),
            "model_path": self.model_path,
            "num_intents": len(self.intents),
            "intents": self.intents
        }
