"""
Rules Engine - Motor de reglas para transacciones y lógica de negocio
"""

import logging
from typing import Dict, Any, List, Optional
import json
import os
from datetime import datetime, timedelta
import re

logger = logging.getLogger(__name__)


class RulesEngine:
    """
    Motor de reglas para manejar transacciones y lógica de negocio
    
    Maneja:
    - Compras y pagos
    - Agendamiento de citas
    - Fiados y créditos
    - Validaciones de negocio
    - Flujos transaccionales
    """
    
    def __init__(self):
        self.rules = {}
        self.transactional_intents = [
            "schedule_appointment",
            "reschedule_appointment",
            "cancel_appointment",
            "payment_confirm",
            "credit_request",
            "credit_payment",
            "order_status"
        ]
        
    async def load_rules(self):
        """Carga reglas desde archivo de configuración"""
        try:
            rules_path = "/data/rules/business_rules.json"
            if os.path.exists(rules_path):
                with open(rules_path, 'r', encoding='utf-8') as f:
                    self.rules = json.load(f)
                logger.info(f"✅ Reglas cargadas: {len(self.rules)} reglas")
            else:
                logger.warning("No se encontró archivo de reglas, usando reglas por defecto")
                self._load_default_rules()
        except Exception as e:
            logger.error(f"Error cargando reglas: {e}")
            self._load_default_rules()
    
    def _load_default_rules(self):
        """Carga reglas por defecto"""
        self.rules = {
            "business_hours": {
                "monday_friday": {"start": "08:00", "end": "18:00"},
                "saturday": {"start": "09:00", "end": "14:00"},
                "sunday": "closed"
            },
            "credit_limits": {
                "new_customer": 50000,
                "regular_customer": 200000,
                "vip_customer": 500000
            },
            "payment_methods": [
                "mercadopago",
                "paypal",
                "nequi",
                "daviplata",
                "bancolombia",
                "efectivo"
            ],
            "delivery_times": {
                "local": "1-2 días",
                "nacional": "3-5 días",
                "dropshipping": "5-10 días"
            }
        }
    
    def is_transactional(self, intent: str) -> bool:
        """Verifica si una intención es transaccional"""
        return intent in self.transactional_intents
    
    async def process(
        self,
        intent: str,
        text: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Procesa una intención transaccional
        
        Returns:
            {
                "reply": str,
                "actions": Dict,
                "next_step": str
            }
        """
        
        try:
            # Route to specific handler
            if intent == "schedule_appointment":
                return await self._handle_schedule_appointment(text, user_id, context)
            
            elif intent == "reschedule_appointment":
                return await self._handle_reschedule_appointment(text, user_id, context)
            
            elif intent == "cancel_appointment":
                return await self._handle_cancel_appointment(text, user_id, context)
            
            elif intent == "payment_confirm":
                return await self._handle_payment_confirm(text, user_id, context)
            
            elif intent == "credit_request":
                return await self._handle_credit_request(text, user_id, context)
            
            elif intent == "credit_payment":
                return await self._handle_credit_payment(text, user_id, context)
            
            elif intent == "order_status":
                return await self._handle_order_status(text, user_id, context)
            
            else:
                return {
                    "reply": "Entiendo que necesitas ayuda con esto. ¿Puedes darme más detalles?",
                    "actions": {},
                    "next_step": "clarify"
                }
                
        except Exception as e:
            logger.error(f"Error procesando regla para {intent}: {e}")
            return {
                "reply": "Disculpa, tuve un problema procesando tu solicitud. ¿Puedes intentar de nuevo?",
                "actions": {"error": str(e)},
                "next_step": "retry"
            }
    
    async def _handle_schedule_appointment(
        self,
        text: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Maneja agendamiento de citas"""
        
        # Check if service type is specified
        service_type = context.get("service_type")
        
        if not service_type:
            return {
                "reply": "¿Qué servicio necesitas?\n\n1. 💇 Barbería\n2. 🦷 Odontología\n3. 🔧 Soporte técnico\n4. 📱 Reparación de celulares\n\nResponde con el número o nombre del servicio.",
                "actions": {"request": "service_type"},
                "next_step": "await_service_type"
            }
        
        # Check if date/time is specified
        preferred_date = context.get("preferred_date")
        
        if not preferred_date:
            # Get available slots
            available_slots = self._get_available_slots(service_type)
            
            slots_text = "\n".join([
                f"{i+1}. {slot['date']} - {slot['time']}"
                for i, slot in enumerate(available_slots[:5])
            ])
            
            return {
                "reply": f"Perfecto! Horarios disponibles para {service_type}:\n\n{slots_text}\n\n¿Cuál prefieres? (responde con el número)",
                "actions": {
                    "request": "preferred_slot",
                    "available_slots": available_slots
                },
                "next_step": "await_slot_selection"
            }
        
        # Confirm appointment
        return {
            "reply": f"✅ ¡Cita confirmada!\n\n📅 Servicio: {service_type}\n🕐 Fecha: {preferred_date}\n📍 Ubicación: Tecnovariedades D&S\n\nTe enviaremos un recordatorio 1 hora antes. ¿Necesitas algo más?",
            "actions": {
                "create_appointment": {
                    "user_id": user_id,
                    "service_type": service_type,
                    "date": preferred_date,
                    "status": "confirmed"
                },
                "send_confirmation": True
            },
            "next_step": "completed"
        }
    
    async def _handle_reschedule_appointment(
        self,
        text: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Maneja reprogramación de citas"""
        
        return {
            "reply": "Claro, puedo ayudarte a reprogramar tu cita. ¿Para qué nueva fecha y hora te gustaría?",
            "actions": {"request": "new_datetime"},
            "next_step": "await_new_datetime"
        }
    
    async def _handle_cancel_appointment(
        self,
        text: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Maneja cancelación de citas"""
        
        return {
            "reply": "Entiendo que necesitas cancelar tu cita. ¿Estás seguro? (Sí/No)",
            "actions": {"request": "confirm_cancellation"},
            "next_step": "await_confirmation"
        }
    
    async def _handle_payment_confirm(
        self,
        text: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Maneja confirmación de pagos"""
        
        # Extract payment reference if present
        reference = self._extract_payment_reference(text)
        
        if reference:
            return {
                "reply": f"✅ Pago recibido!\n\nReferencia: {reference}\n\nEstamos verificando tu pago. Te confirmaremos en los próximos minutos. ¡Gracias por tu compra!",
                "actions": {
                    "verify_payment": {
                        "user_id": user_id,
                        "reference": reference
                    }
                },
                "next_step": "payment_verification"
            }
        else:
            return {
                "reply": "Perfecto! Para confirmar tu pago necesito:\n\n1. Número de referencia o comprobante\n2. Método de pago usado\n3. Monto pagado\n\n¿Puedes compartir esta información?",
                "actions": {"request": "payment_details"},
                "next_step": "await_payment_details"
            }
    
    async def _handle_credit_request(
        self,
        text: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Maneja solicitudes de fiado/crédito"""
        
        # Check customer history (mock - should query DB)
        customer_type = context.get("customer_type", "new_customer")
        credit_limit = self.rules["credit_limits"].get(customer_type, 50000)
        
        # Extract amount if present
        amount = self._extract_amount(text)
        
        if amount and amount <= credit_limit:
            return {
                "reply": f"✅ Fiado aprobado!\n\n💰 Monto: ${amount:,.0f}\n📅 Fecha límite: {self._get_credit_deadline()}\n\n¿Qué producto deseas llevar?",
                "actions": {
                    "approve_credit": {
                        "user_id": user_id,
                        "amount": amount,
                        "deadline": self._get_credit_deadline()
                    }
                },
                "next_step": "select_product"
            }
        elif amount and amount > credit_limit:
            return {
                "reply": f"Tu límite de crédito actual es ${credit_limit:,.0f}. El monto solicitado (${amount:,.0f}) excede este límite. ¿Deseas ajustar el monto?",
                "actions": {"credit_limit_exceeded": True},
                "next_step": "adjust_amount"
            }
        else:
            return {
                "reply": f"Tu límite de crédito disponible es ${credit_limit:,.0f}. ¿Qué monto necesitas?",
                "actions": {"request": "credit_amount"},
                "next_step": "await_amount"
            }
    
    async def _handle_credit_payment(
        self,
        text: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Maneja pagos de fiados"""
        
        return {
            "reply": "Perfecto! ¿Cuánto vas a abonar a tu fiado?",
            "actions": {"request": "payment_amount"},
            "next_step": "await_payment_amount"
        }
    
    async def _handle_order_status(
        self,
        text: str,
        user_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Maneja consultas de estado de pedido"""
        
        # Extract order number if present
        order_number = self._extract_order_number(text)
        
        if order_number:
            # Mock order status (should query DB)
            return {
                "reply": f"📦 Estado de tu pedido #{order_number}:\n\n✅ Confirmado\n🚚 En camino\n📍 Llegada estimada: 2-3 días\n\n¿Necesitas algo más?",
                "actions": {
                    "query_order": {
                        "order_number": order_number
                    }
                },
                "next_step": "completed"
            }
        else:
            return {
                "reply": "Para consultar tu pedido necesito el número de orden. ¿Cuál es?",
                "actions": {"request": "order_number"},
                "next_step": "await_order_number"
            }
    
    # Helper methods
    
    def _get_available_slots(self, service_type: str) -> List[Dict[str, str]]:
        """Obtiene slots disponibles (mock)"""
        # In production, query database
        today = datetime.now()
        slots = []
        
        for i in range(1, 8):
            date = today + timedelta(days=i)
            if date.weekday() < 6:  # Monday to Saturday
                for hour in ["10:00", "14:00", "16:00"]:
                    slots.append({
                        "date": date.strftime("%d/%m/%Y"),
                        "time": hour,
                        "available": True
                    })
        
        return slots[:10]
    
    def _get_credit_deadline(self) -> str:
        """Calcula fecha límite de crédito"""
        deadline = datetime.now() + timedelta(days=30)
        return deadline.strftime("%d/%m/%Y")
    
    def _extract_payment_reference(self, text: str) -> Optional[str]:
        """Extrae referencia de pago del texto"""
        # Look for patterns like: REF123456, #123456, etc
        patterns = [
            r'REF\s*(\d+)',
            r'#\s*(\d+)',
            r'referencia\s*:?\s*(\d+)',
            r'comprobante\s*:?\s*(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def _extract_amount(self, text: str) -> Optional[float]:
        """Extrae monto del texto"""
        # Look for patterns like: $50000, 50.000, 50k
        patterns = [
            r'\$\s*([\d,\.]+)',
            r'([\d,\.]+)\s*mil',
            r'([\d,\.]+)k'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '').replace('.', '')
                try:
                    amount = float(amount_str)
                    if 'mil' in text.lower() or 'k' in text.lower():
                        amount *= 1000
                    return amount
                except:
                    continue
        
        return None
    
    def _extract_order_number(self, text: str) -> Optional[str]:
        """Extrae número de orden del texto"""
        patterns = [
            r'#\s*(\d+)',
            r'orden\s*:?\s*(\d+)',
            r'pedido\s*:?\s*(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
