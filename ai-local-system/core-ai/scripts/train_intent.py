"""
Script para entrenar el clasificador de intenciones
"""

import fasttext
import os
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_training_data():
    """Crea datos de entrenamiento iniciales"""
    
    training_data = [
        # Precios
        ("¿Cuánto cuesta el Macbook?", "product_price"),
        ("Precio del iPhone 15", "product_price"),
        ("Cuál es el valor del portátil", "product_price"),
        ("Me dices el precio", "product_price"),
        ("Cuánto vale", "product_price"),
        
        # Disponibilidad
        ("Tienen stock del teclado", "product_availability"),
        ("Hay disponibilidad", "product_availability"),
        ("Tienen en tienda", "product_availability"),
        ("Queda alguno", "product_availability"),
        ("Está disponible", "product_availability"),
        
        # Información de producto
        ("Características del laptop", "product_info"),
        ("Especificaciones técnicas", "product_info"),
        ("Qué incluye", "product_info"),
        ("Detalles del producto", "product_info"),
        ("Información completa", "product_info"),
        
        # Comparación
        ("Diferencia entre iPhone y Samsung", "product_compare"),
        ("Cuál es mejor", "product_compare"),
        ("Comparar productos", "product_compare"),
        ("Versus", "product_compare"),
        
        # Recomendación
        ("Qué me recomiendas", "product_recommend"),
        ("Cuál es el mejor para diseño", "product_recommend"),
        ("Sugiéreme algo", "product_recommend"),
        ("Qué portátil me conviene", "product_recommend"),
        
        # Agendar cita
        ("Quiero una cita", "schedule_appointment"),
        ("Agendar turno", "schedule_appointment"),
        ("Reservar hora", "schedule_appointment"),
        ("Necesito cita para corte", "schedule_appointment"),
        
        # Reprogramar cita
        ("Cambiar mi cita", "reschedule_appointment"),
        ("Mover la cita", "reschedule_appointment"),
        ("Reprogramar turno", "reschedule_appointment"),
        
        # Cancelar cita
        ("Cancelar mi cita", "cancel_appointment"),
        ("Anular turno", "cancel_appointment"),
        ("No puedo ir", "cancel_appointment"),
        
        # Estado de pedido
        ("Dónde está mi pedido", "order_status"),
        ("Estado de mi orden", "order_status"),
        ("Cuándo llega", "order_status"),
        ("Tracking", "order_status"),
        
        # Información de pago
        ("Cómo puedo pagar", "payment_info"),
        ("Métodos de pago", "payment_info"),
        ("Aceptan tarjeta", "payment_info"),
        ("Formas de pago", "payment_info"),
        
        # Confirmar pago
        ("Ya pagué", "payment_confirm"),
        ("Hice la transferencia", "payment_confirm"),
        ("Confirmé el pago", "payment_confirm"),
        ("Envié el comprobante", "payment_confirm"),
        
        # Solicitar crédito
        ("Necesito fiado", "credit_request"),
        ("Puedo pagar a plazos", "credit_request"),
        ("Crédito disponible", "credit_request"),
        ("Fiar", "credit_request"),
        
        # Pagar crédito
        ("Abonar al fiado", "credit_payment"),
        ("Pagar mi deuda", "credit_payment"),
        ("Cuánto debo", "credit_payment"),
        
        # Reclamo
        ("Tengo un problema", "complaint"),
        ("Queja", "complaint"),
        ("No funciona", "complaint"),
        ("Está defectuoso", "complaint"),
        ("Reclamo", "complaint"),
        
        # Saludo
        ("Hola", "greeting"),
        ("Buenos días", "greeting"),
        ("Buenas tardes", "greeting"),
        ("Hey", "greeting"),
        ("Qué tal", "greeting"),
        
        # Despedida
        ("Adiós", "farewell"),
        ("Chao", "farewell"),
        ("Hasta luego", "farewell"),
        ("Nos vemos", "farewell"),
        ("Bye", "farewell"),
        
        # Agradecimiento
        ("Gracias", "thanks"),
        ("Muchas gracias", "thanks"),
        ("Te agradezco", "thanks"),
        ("Gracias por la ayuda", "thanks"),
        
        # Ayuda
        ("Ayuda", "help"),
        ("Ayúdame", "help"),
        ("No entiendo", "help"),
        ("Qué puedes hacer", "help"),
    ]
    
    return training_data


def train_model():
    """Entrena el modelo de intenciones"""
    
    logger.info("🎓 Iniciando entrenamiento de intent classifier...")
    
    # Create training data
    training_data = create_training_data()
    logger.info(f"Datos de entrenamiento: {len(training_data)} ejemplos")
    
    # Create training file
    training_file = Path("/app/training/intent_train.txt")
    training_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(training_file, 'w', encoding='utf-8') as f:
        for text, label in training_data:
            f.write(f"__label__{label} {text}\n")
    
    logger.info(f"Archivo de entrenamiento creado: {training_file}")
    
    # Train model
    logger.info("Entrenando modelo fastText...")
    model = fasttext.train_supervised(
        input=str(training_file),
        epoch=25,
        lr=0.5,
        wordNgrams=2,
        verbose=2,
        dim=100,
        loss='softmax'
    )
    
    # Save model
    model_path = Path("/app/models/intent_ft.bin")
    model_path.parent.mkdir(parents=True, exist_ok=True)
    model.save_model(str(model_path))
    
    logger.info(f"✅ Modelo guardado en: {model_path}")
    
    # Test model
    logger.info("\n🧪 Probando modelo:")
    test_queries = [
        "¿Cuánto cuesta el iPhone?",
        "Tienen disponible el Macbook?",
        "Quiero agendar una cita",
        "Ya hice el pago",
        "Hola buenos días"
    ]
    
    for query in test_queries:
        labels, probs = model.predict(query, k=1)
        label = labels[0].replace('__label__', '')
        prob = probs[0]
        logger.info(f"  '{query}' → {label} ({prob:.2f})")
    
    logger.info("\n✅ Entrenamiento completado!")


if __name__ == "__main__":
    train_model()
