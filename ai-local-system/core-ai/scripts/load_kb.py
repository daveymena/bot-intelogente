"""
Script para cargar la base de conocimiento inicial
"""

import json
import logging
from pathlib import Path
import asyncio
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.embeddings import EmbeddingService
from app.retriever import KnowledgeRetriever

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_initial_kb():
    """Crea base de conocimiento inicial"""
    
    kb_data = {
        "knowledge_base": [
            {
                "id": "kb_001",
                "text": "Tecnovariedades D&S es una tienda de tecnología en Colombia especializada en laptops, celulares, accesorios y servicios técnicos.",
                "metadata": {"category": "about", "type": "general"}
            },
            {
                "id": "kb_002",
                "text": "Horarios de atención: Lunes a Viernes 8:00 AM - 6:00 PM, Sábados 9:00 AM - 2:00 PM. Domingos cerrado.",
                "metadata": {"category": "hours", "type": "general"}
            },
            {
                "id": "kb_003",
                "text": "Métodos de pago aceptados: MercadoPago, PayPal, Nequi, Daviplata, Bancolombia, efectivo y tarjetas de crédito/débito.",
                "metadata": {"category": "payment", "type": "general"}
            },
            {
                "id": "kb_004",
                "text": "Ofrecemos garantía de 30 días en todos nuestros productos. Garantía extendida disponible.",
                "metadata": {"category": "warranty", "type": "general"}
            },
            {
                "id": "kb_005",
                "text": "Envíos a toda Colombia. Bogotá: 1-2 días. Nacional: 3-5 días. Dropshipping internacional: 5-10 días.",
                "metadata": {"category": "shipping", "type": "general"}
            },
            {
                "id": "kb_006",
                "text": "Servicios disponibles: Reparación de celulares, soporte técnico, mantenimiento de computadores, instalación de software.",
                "metadata": {"category": "services", "type": "general"}
            },
            {
                "id": "kb_007",
                "text": "Fiados disponibles para clientes regulares. Límite según historial: Nuevos $50.000, Regulares $200.000, VIP $500.000.",
                "metadata": {"category": "credit", "type": "general"}
            },
            {
                "id": "kb_008",
                "text": "Productos digitales: Cursos online, megapacks de diseño, plantillas, recursos digitales. Entrega inmediata por email.",
                "metadata": {"category": "digital", "type": "general"}
            },
        ],
        
        "products": [
            {
                "id": "prod_001",
                "text": "Macbook Pro M4 16GB RAM 512GB SSD. Precio: $4.500.000. Ideal para diseño gráfico, edición de video y desarrollo. Stock: 3 unidades.",
                "metadata": {"category": "laptop", "brand": "Apple", "price": 4500000}
            },
            {
                "id": "prod_002",
                "text": "Dell XPS 15 Intel i7 16GB RAM 1TB SSD. Precio: $3.800.000. Excelente para diseño y programación. Stock: 5 unidades.",
                "metadata": {"category": "laptop", "brand": "Dell", "price": 3800000}
            },
            {
                "id": "prod_003",
                "text": "iPhone 15 Pro 256GB. Precio: $4.200.000. Última generación con chip A17 Pro. Stock: 2 unidades.",
                "metadata": {"category": "phone", "brand": "Apple", "price": 4200000}
            },
            {
                "id": "prod_004",
                "text": "Samsung Galaxy S24 Ultra 512GB. Precio: $3.900.000. Pantalla AMOLED, cámara 200MP. Stock: 4 unidades.",
                "metadata": {"category": "phone", "brand": "Samsung", "price": 3900000}
            },
            {
                "id": "prod_005",
                "text": "Teclado Mecánico Logitech G Pro. Precio: $450.000. Switches mecánicos, RGB, ideal gaming. Stock: 10 unidades.",
                "metadata": {"category": "accessory", "brand": "Logitech", "price": 450000}
            },
            {
                "id": "prod_006",
                "text": "Mouse Logitech MX Master 3. Precio: $320.000. Ergonómico, precisión profesional. Stock: 8 unidades.",
                "metadata": {"category": "accessory", "brand": "Logitech", "price": 320000}
            },
            {
                "id": "prod_007",
                "text": "Curso Completo de Piano Online. Precio: $180.000. 50 lecciones, certificado incluido. Acceso inmediato.",
                "metadata": {"category": "digital", "type": "course", "price": 180000}
            },
            {
                "id": "prod_008",
                "text": "Megapack Diseño Gráfico 20.000 recursos. Precio: $120.000. Plantillas, mockups, fuentes, iconos. Descarga inmediata.",
                "metadata": {"category": "digital", "type": "megapack", "price": 120000}
            },
        ],
        
        "faqs": [
            {
                "id": "faq_001",
                "text": "P: ¿Hacen envíos a toda Colombia?\nR: Sí, enviamos a todo el país. Bogotá 1-2 días, otras ciudades 3-5 días.",
                "metadata": {"category": "shipping", "type": "faq"}
            },
            {
                "id": "faq_002",
                "text": "P: ¿Aceptan tarjetas de crédito?\nR: Sí, aceptamos todas las tarjetas de crédito y débito, además de MercadoPago, PayPal, Nequi y Daviplata.",
                "metadata": {"category": "payment", "type": "faq"}
            },
            {
                "id": "faq_003",
                "text": "P: ¿Tienen garantía los productos?\nR: Todos nuestros productos tienen garantía de 30 días. También ofrecemos garantía extendida.",
                "metadata": {"category": "warranty", "type": "faq"}
            },
            {
                "id": "faq_004",
                "text": "P: ¿Puedo pagar en cuotas?\nR: Sí, con tarjetas de crédito puedes diferir hasta en 36 cuotas. También ofrecemos fiados para clientes regulares.",
                "metadata": {"category": "payment", "type": "faq"}
            },
            {
                "id": "faq_005",
                "text": "P: ¿Hacen reparaciones?\nR: Sí, reparamos celulares, laptops y ofrecemos soporte técnico. Agenda tu cita por WhatsApp.",
                "metadata": {"category": "services", "type": "faq"}
            },
        ]
    }
    
    return kb_data


async def load_knowledge_base():
    """Carga la base de conocimiento en Qdrant"""
    
    logger.info("📚 Cargando base de conocimiento...")
    
    # Initialize services
    logger.info("Inicializando servicios...")
    embedding_service = EmbeddingService()
    await embedding_service.load_model()
    
    knowledge_retriever = KnowledgeRetriever(embedding_service)
    await knowledge_retriever.initialize()
    
    # Create initial KB
    kb_data = create_initial_kb()
    
    # Load each collection
    for collection_name, documents in kb_data.items():
        logger.info(f"\n📂 Cargando colección: {collection_name}")
        logger.info(f"   Documentos: {len(documents)}")
        
        # Add documents
        added = await knowledge_retriever.add_documents_batch(
            documents=documents,
            collection=collection_name
        )
        
        logger.info(f"   ✅ {added} documentos agregados")
    
    # Get stats
    stats = await knowledge_retriever.get_stats()
    logger.info("\n📊 Estadísticas finales:")
    for collection, info in stats.items():
        logger.info(f"   {collection}: {info.get('points_count', 0)} documentos")
    
    logger.info("\n✅ Base de conocimiento cargada correctamente!")


if __name__ == "__main__":
    asyncio.run(load_knowledge_base())
