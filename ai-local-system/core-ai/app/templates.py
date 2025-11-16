"""
Template Engine - Motor de plantillas para formateo de respuestas
"""

import logging
from typing import Dict, Any
import re

logger = logging.getLogger(__name__)


class TemplateEngine:
    """
    Motor de plantillas para formatear respuestas de manera consistente
    """
    
    def __init__(self):
        self.templates = {}
        
    async def load_templates(self):
        """Carga plantillas"""
        self.templates = {
            "product_card": """📱 *{name}*

💰 Precio: ${price:,.0f}
📦 Stock: {stock} unidades
✨ {description}

{cta}""",
            
            "appointment_confirmation": """✅ *Cita Confirmada*

📅 Fecha: {date}
🕐 Hora: {time}
📍 Lugar: {location}
👤 Servicio: {service}

Te enviaremos un recordatorio. ¡Nos vemos!""",
            
            "payment_link": """💳 *Link de Pago*

Producto: {product_name}
Monto: ${amount:,.0f}

🔗 {payment_url}

Métodos disponibles: {methods}""",
            
            "order_status": """📦 *Estado de tu Pedido*

Orden: #{order_number}
Estado: {status}
Fecha estimada: {eta}

{tracking_info}"""
        }
        
        logger.info("✅ Plantillas cargadas")
    
    async def format(
        self,
        text: str,
        intent: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Formatea el texto aplicando plantillas y estilos
        
        Args:
            text: Texto a formatear
            intent: Intención detectada
            context: Contexto con variables
            
        Returns:
            Texto formateado
        """
        
        # Apply WhatsApp formatting
        formatted = self._apply_whatsapp_formatting(text)
        
        # Add emojis if needed
        formatted = self._add_contextual_emojis(formatted, intent)
        
        # Ensure proper line breaks
        formatted = self._normalize_line_breaks(formatted)
        
        return formatted
    
    def _apply_whatsapp_formatting(self, text: str) -> str:
        """Aplica formato de WhatsApp (bold, italic)"""
        
        # Bold for prices
        text = re.sub(
            r'\$\s*([\d,\.]+)',
            r'*$\1*',
            text
        )
        
        # Bold for product names (if in quotes)
        text = re.sub(
            r'"([^"]+)"',
            r'*\1*',
            text
        )
        
        return text
    
    def _add_contextual_emojis(self, text: str, intent: str) -> str:
        """Agrega emojis contextuales si no los tiene"""
        
        emoji_map = {
            "product_price": "💰",
            "product_availability": "📦",
            "schedule_appointment": "📅",
            "payment_confirm": "✅",
            "greeting": "👋",
            "thanks": "🙏"
        }
        
        emoji = emoji_map.get(intent)
        
        # Only add if text doesn't have emojis
        if emoji and not self._has_emoji(text):
            text = f"{emoji} {text}"
        
        return text
    
    def _has_emoji(self, text: str) -> bool:
        """Verifica si el texto tiene emojis"""
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags
            "]+",
            flags=re.UNICODE
        )
        return bool(emoji_pattern.search(text))
    
    def _normalize_line_breaks(self, text: str) -> str:
        """Normaliza saltos de línea"""
        # Remove excessive line breaks
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Ensure space after periods
        text = re.sub(r'\.([A-Z])', r'. \1', text)
        
        return text.strip()
