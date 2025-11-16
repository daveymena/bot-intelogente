"""
Mini-LLM Service - Modelo pequeño para reescritura y generación
"""

import logging
from typing import Dict, Any, List, Optional
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import os
import json

logger = logging.getLogger(__name__)


class MiniLLMService:
    """
    Servicio de Mini-LLM para reescritura y generación de respuestas
    
    Modelos soportados:
    - Qwen/Qwen2.5-0.5B-Instruct (500M parámetros)
    - microsoft/phi-2 (2.7B parámetros)
    - TinyLlama/TinyLlama-1.1B-Chat-v1.0 (1.1B parámetros)
    
    Usa cuantización 4-bit para reducir memoria
    """
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name or os.getenv(
            "AI_MODEL",
            "Qwen/Qwen2.5-0.5B-Instruct"
        )
        self.model = None
        self.tokenizer = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.max_tokens = int(os.getenv("MAX_TOKENS", "512"))
        self.temperature = float(os.getenv("TEMPERATURE", "0.7"))
        
        # System prompt
        self.system_prompt = """Eres un asistente de ventas especializado para Tecnovariedades D&S en Colombia.

REGLAS IMPORTANTES:
1. Habla español colombiano natural y amigable
2. Solo usa información provista en el contexto
3. NO inventes datos, precios o disponibilidad
4. Sé conciso pero completo
5. Siempre incluye un CTA (Call To Action)
6. Usa emojis moderadamente para dar calidez
7. Si no sabes algo, di "Déjame verificar eso"

FORMATO DE RESPUESTA:
- Saludo breve si es primera interacción
- Respuesta directa a la pregunta
- Información adicional relevante
- CTA claro (siguiente paso)

EJEMPLOS DE BUEN TONO:
✅ "Claro! El Macbook Pro M4 está en $4.500.000. Tenemos 3 unidades disponibles. ¿Te gustaría reservar uno?"
✅ "Perfecto! Para el diseño gráfico te recomiendo el Dell XPS 15 ($3.800.000) o el Macbook Pro M4 ($4.500.000). ¿Cuál se ajusta mejor a tu presupuesto?"
✅ "Entiendo tu necesidad. Déjame verificar la disponibilidad exacta y te confirmo en un momento."

EVITA:
❌ Respuestas muy largas
❌ Lenguaje muy formal o robótico
❌ Inventar información
❌ Respuestas sin CTA"""
        
    async def load_model(self):
        """Carga el modelo con cuantización 4-bit"""
        try:
            logger.info(f"Cargando Mini-LLM: {self.model_name}")
            logger.info(f"Device: {self.device}")
            
            # Quantization config for 4-bit
            quantization_config = BitsAndBytesConfig(
                load_in_4bit=True,
                bnb_4bit_compute_dtype=torch.float16,
                bnb_4bit_use_double_quant=True,
                bnb_4bit_quant_type="nf4"
            )
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            # Load model
            if self.device == "cuda":
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    quantization_config=quantization_config,
                    device_map="auto",
                    trust_remote_code=True
                )
            else:
                # CPU mode - no quantization
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    torch_dtype=torch.float32,
                    trust_remote_code=True
                )
                self.model.to(self.device)
            
            logger.info(f"✅ Mini-LLM cargado en {self.device}")
            
        except Exception as e:
            logger.error(f"Error cargando Mini-LLM: {e}")
            raise
    
    def is_loaded(self) -> bool:
        """Verifica si el modelo está cargado"""
        return self.model is not None and self.tokenizer is not None
    
    async def generate(
        self,
        input_data: Dict[str, Any],
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Genera respuesta usando el Mini-LLM
        
        Args:
            input_data: {
                "intent": str,
                "query": str,
                "context": Dict,
                "retrieved_docs": List[Dict]
            }
            max_tokens: Máximo de tokens a generar
            temperature: Temperatura de generación
            
        Returns:
            {
                "text": str,
                "actions": Dict,
                "confidence": float
            }
        """
        
        if not self.is_loaded():
            raise RuntimeError("Modelo no cargado")
        
        try:
            # Build prompt
            prompt = self._build_prompt(input_data)
            
            # Tokenize
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=2048
            ).to(self.device)
            
            # Generate
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=max_tokens or self.max_tokens,
                    temperature=temperature or self.temperature,
                    do_sample=True,
                    top_p=0.9,
                    top_k=50,
                    repetition_penalty=1.1,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Decode
            generated_text = self.tokenizer.decode(
                outputs[0][inputs['input_ids'].shape[1]:],
                skip_special_tokens=True
            )
            
            # Parse response
            parsed = self._parse_response(generated_text, input_data)
            
            logger.info(f"Respuesta generada: {parsed['text'][:100]}...")
            
            return parsed
            
        except Exception as e:
            logger.error(f"Error generando respuesta: {e}")
            # Fallback to template-based response
            return self._fallback_response(input_data)
    
    def _build_prompt(self, input_data: Dict[str, Any]) -> str:
        """Construye el prompt para el modelo"""
        
        intent = input_data.get("intent", "unknown")
        query = input_data.get("query", "")
        context = input_data.get("context", {})
        retrieved_docs = input_data.get("retrieved_docs", [])
        
        # Build context section
        context_text = ""
        if retrieved_docs:
            context_text = "\n\nINFORMACIÓN DISPONIBLE:\n"
            for i, doc in enumerate(retrieved_docs[:3], 1):
                context_text += f"{i}. {doc.get('text', '')}\n"
        
        # Build conversation history
        history_text = ""
        if context.get("recent_messages"):
            history_text = "\n\nCONVERSACIÓN RECIENTE:\n"
            for msg in context["recent_messages"][-3:]:
                role = "Cliente" if msg["role"] == "user" else "Asistente"
                history_text += f"{role}: {msg['content']}\n"
        
        # Build full prompt
        prompt = f"""{self.system_prompt}

INTENCIÓN DETECTADA: {intent}

PREGUNTA DEL CLIENTE:
{query}
{context_text}
{history_text}

RESPUESTA (en formato JSON):
{{
  "reply": "tu respuesta aquí",
  "actions": {{"suggest": ["acción1", "acción2"]}},
  "confidence": 0.95
}}

Genera SOLO el JSON, sin texto adicional:"""
        
        return prompt
    
    def _parse_response(
        self,
        generated_text: str,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Parsea la respuesta generada"""
        
        try:
            # Try to extract JSON
            json_match = generated_text.strip()
            
            # Clean up common issues
            if not json_match.startswith('{'):
                # Find first {
                start = json_match.find('{')
                if start != -1:
                    json_match = json_match[start:]
            
            if not json_match.endswith('}'):
                # Find last }
                end = json_match.rfind('}')
                if end != -1:
                    json_match = json_match[:end+1]
            
            # Parse JSON
            parsed = json.loads(json_match)
            
            return {
                "text": parsed.get("reply", generated_text),
                "actions": parsed.get("actions", {}),
                "confidence": parsed.get("confidence", 0.8)
            }
            
        except json.JSONDecodeError:
            # If JSON parsing fails, use raw text
            logger.warning("No se pudo parsear JSON, usando texto raw")
            return {
                "text": generated_text.strip(),
                "actions": {},
                "confidence": 0.7
            }
    
    def _fallback_response(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Respuesta de fallback si el modelo falla"""
        
        intent = input_data.get("intent", "unknown")
        retrieved_docs = input_data.get("retrieved_docs", [])
        
        # Use first retrieved doc if available
        if retrieved_docs:
            text = retrieved_docs[0].get("text", "")
            return {
                "text": text,
                "actions": {},
                "confidence": 0.6
            }
        
        # Generic fallback
        fallback_responses = {
            "product_price": "Déjame verificar el precio exacto para ti. ¿Me das un momento?",
            "product_availability": "Voy a consultar la disponibilidad y te confirmo enseguida.",
            "product_info": "Claro, déjame buscar esa información para ti.",
            "greeting": "¡Hola! Bienvenido a Tecnovariedades D&S. ¿En qué puedo ayudarte hoy?",
            "thanks": "¡Con gusto! Estoy aquí para ayudarte. ¿Necesitas algo más?",
            "help": "Claro, estoy aquí para ayudarte. ¿Qué necesitas saber?"
        }
        
        text = fallback_responses.get(
            intent,
            "Entiendo tu consulta. Déjame ayudarte con eso. ¿Puedes darme más detalles?"
        )
        
        return {
            "text": text,
            "actions": {},
            "confidence": 0.5
        }
    
    async def get_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del modelo"""
        return {
            "model_name": self.model_name,
            "device": self.device,
            "loaded": self.is_loaded(),
            "max_tokens": self.max_tokens,
            "temperature": self.temperature
        }
