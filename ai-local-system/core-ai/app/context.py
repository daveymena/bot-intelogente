"""
Conversation Context - Manejo de contexto de conversación
"""

import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
from collections import defaultdict

logger = logging.getLogger(__name__)


class ConversationContext:
    """
    Maneja el contexto de conversación por usuario
    
    Almacena:
    - Últimos N mensajes
    - Variables de sesión
    - Estado de flujos
    - Timestamp de última interacción
    """
    
    def __init__(self, max_messages: int = 10, ttl_hours: int = 24):
        self.max_messages = max_messages
        self.ttl_hours = ttl_hours
        self.contexts = defaultdict(lambda: {
            "messages": [],
            "variables": {},
            "flow_state": None,
            "last_interaction": None
        })
        
    def get_context(self, user_id: str) -> Dict[str, Any]:
        """Obtiene el contexto de un usuario"""
        
        context = self.contexts[user_id]
        
        # Check if context is expired
        if context["last_interaction"]:
            elapsed = datetime.utcnow() - context["last_interaction"]
            if elapsed > timedelta(hours=self.ttl_hours):
                logger.info(f"Contexto expirado para {user_id}, reseteando")
                self.reset_context(user_id)
                context = self.contexts[user_id]
        
        return {
            "recent_messages": context["messages"],
            "variables": context["variables"],
            "flow_state": context["flow_state"]
        }
    
    def add_message(
        self,
        user_id: str,
        role: str,
        content: str
    ):
        """Agrega un mensaje al contexto"""
        
        context = self.contexts[user_id]
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        context["messages"].append(message)
        
        # Keep only last N messages
        if len(context["messages"]) > self.max_messages:
            context["messages"] = context["messages"][-self.max_messages:]
        
        # Update last interaction
        context["last_interaction"] = datetime.utcnow()
    
    def set_variable(self, user_id: str, key: str, value: Any):
        """Establece una variable de contexto"""
        self.contexts[user_id]["variables"][key] = value
    
    def get_variable(self, user_id: str, key: str, default: Any = None) -> Any:
        """Obtiene una variable de contexto"""
        return self.contexts[user_id]["variables"].get(key, default)
    
    def set_flow_state(self, user_id: str, state: str):
        """Establece el estado del flujo"""
        self.contexts[user_id]["flow_state"] = state
    
    def get_flow_state(self, user_id: str) -> str:
        """Obtiene el estado del flujo"""
        return self.contexts[user_id]["flow_state"]
    
    def reset_context(self, user_id: str):
        """Resetea el contexto de un usuario"""
        self.contexts[user_id] = {
            "messages": [],
            "variables": {},
            "flow_state": None,
            "last_interaction": None
        }
        logger.info(f"Contexto reseteado para {user_id}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de contextos"""
        active_contexts = sum(
            1 for ctx in self.contexts.values()
            if ctx["last_interaction"] and
            (datetime.utcnow() - ctx["last_interaction"]) < timedelta(hours=self.ttl_hours)
        )
        
        return {
            "total_contexts": len(self.contexts),
            "active_contexts": active_contexts,
            "max_messages": self.max_messages,
            "ttl_hours": self.ttl_hours
        }
