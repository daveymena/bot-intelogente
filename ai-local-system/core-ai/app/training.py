"""
Auto Trainer - Sistema de entrenamiento automático
"""

import logging
from typing import Dict, Any, List
from datetime import datetime
import json
import os
from pathlib import Path

logger = logging.getLogger(__name__)


class AutoTrainer:
    """
    Sistema de entrenamiento automático que aprende de conversaciones reales
    
    Funciones:
    - Log de interacciones
    - Extracción de ejemplos de entrenamiento
    - Re-entrenamiento periódico
    - Validación de calidad
    """
    
    def __init__(
        self,
        intent_classifier,
        embedding_service,
        knowledge_retriever
    ):
        self.intent_classifier = intent_classifier
        self.embedding_service = embedding_service
        self.knowledge_retriever = knowledge_retriever
        
        self.training_dir = Path("/app/training")
        self.training_dir.mkdir(exist_ok=True)
        
        self.interactions_log = self.training_dir / "interactions.jsonl"
        self.training_data = self.training_dir / "training_data.txt"
        
        self.min_samples = int(os.getenv("MIN_SAMPLES_FOR_TRAIN", "100"))
        self.auto_train_enabled = os.getenv("AUTO_TRAIN_ENABLED", "true").lower() == "true"
        
    async def log_interaction(
        self,
        user_id: str,
        query: str,
        intent: str,
        confidence: float,
        response: str,
        timestamp: datetime
    ):
        """Registra una interacción para entrenamiento futuro"""
        
        try:
            interaction = {
                "user_id": user_id,
                "query": query,
                "intent": intent,
                "confidence": confidence,
                "response": response,
                "timestamp": timestamp.isoformat()
            }
            
            # Append to log file
            with open(self.interactions_log, 'a', encoding='utf-8') as f:
                f.write(json.dumps(interaction, ensure_ascii=False) + '\n')
                
        except Exception as e:
            logger.error(f"Error logging interaction: {e}")
    
    async def train_from_conversation(
        self,
        conversation_id: str,
        messages: List[Dict[str, str]],
        outcome: str,
        feedback: Optional[str] = None
    ):
        """
        Entrena el sistema con una conversación completa
        
        Args:
            conversation_id: ID de la conversación
            messages: Lista de mensajes [{"role": "user/assistant", "content": "..."}]
            outcome: Resultado (success, failure, escalated)
            feedback: Feedback opcional del usuario
        """
        
        try:
            logger.info(f"Entrenando con conversación {conversation_id} (outcome: {outcome})")
            
            # Only train on successful conversations
            if outcome != "success":
                logger.info("Conversación no exitosa, saltando entrenamiento")
                return
            
            # Extract training examples
            examples = self._extract_training_examples(messages)
            
            if not examples:
                logger.warning("No se pudieron extraer ejemplos de entrenamiento")
                return
            
            # Save examples
            await self._save_training_examples(examples)
            
            # Check if we have enough samples to retrain
            total_samples = await self._count_training_samples()
            
            if total_samples >= self.min_samples and self.auto_train_enabled:
                logger.info(f"Suficientes muestras ({total_samples}), iniciando re-entrenamiento")
                await self._retrain_models()
            else:
                logger.info(f"Muestras actuales: {total_samples}/{self.min_samples}")
            
        except Exception as e:
            logger.error(f"Error en train_from_conversation: {e}")
    
    def _extract_training_examples(
        self,
        messages: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        """Extrae ejemplos de entrenamiento de una conversación"""
        
        examples = []
        
        for i, msg in enumerate(messages):
            if msg["role"] == "user":
                # Get user message
                user_text = msg["content"]
                
                # Get assistant response if available
                assistant_text = None
                if i + 1 < len(messages) and messages[i + 1]["role"] == "assistant":
                    assistant_text = messages[i + 1]["content"]
                
                if assistant_text:
                    examples.append({
                        "query": user_text,
                        "response": assistant_text
                    })
        
        return examples
    
    async def _save_training_examples(self, examples: List[Dict[str, Any]]):
        """Guarda ejemplos de entrenamiento"""
        
        try:
            # Save for intent classifier (fastText format)
            with open(self.training_data, 'a', encoding='utf-8') as f:
                for example in examples:
                    # Predict intent for labeling
                    intent_result = await self.intent_classifier.predict(example["query"])
                    intent = intent_result["intent"]
                    
                    # Write in fastText format: __label__<intent> <text>
                    f.write(f"__label__{intent} {example['query']}\n")
            
            # Save for knowledge base
            kb_examples = [
                {
                    "text": f"Q: {ex['query']}\nA: {ex['response']}",
                    "metadata": {"source": "conversation", "type": "qa_pair"}
                }
                for ex in examples
            ]
            
            await self.knowledge_retriever.add_documents_batch(
                kb_examples,
                collection="conversations"
            )
            
            logger.info(f"✅ {len(examples)} ejemplos guardados")
            
        except Exception as e:
            logger.error(f"Error guardando ejemplos: {e}")
    
    async def _count_training_samples(self) -> int:
        """Cuenta el número de muestras de entrenamiento"""
        
        try:
            if not self.training_data.exists():
                return 0
            
            with open(self.training_data, 'r', encoding='utf-8') as f:
                return sum(1 for _ in f)
                
        except Exception as e:
            logger.error(f"Error contando muestras: {e}")
            return 0
    
    async def _retrain_models(self):
        """Re-entrena los modelos con nuevos datos"""
        
        try:
            logger.info("🎓 Iniciando re-entrenamiento de modelos...")
            
            # 1. Retrain intent classifier
            logger.info("Re-entrenando intent classifier...")
            await self._retrain_intent_classifier()
            
            # 2. Reindex knowledge base
            logger.info("Re-indexando knowledge base...")
            await self.knowledge_retriever.reindex()
            
            logger.info("✅ Re-entrenamiento completado")
            
            # Archive training data
            await self._archive_training_data()
            
        except Exception as e:
            logger.error(f"Error en re-entrenamiento: {e}")
    
    async def _retrain_intent_classifier(self):
        """Re-entrena el clasificador de intenciones"""
        
        try:
            import fasttext
            
            # Train new model
            model = fasttext.train_supervised(
                input=str(self.training_data),
                epoch=25,
                lr=0.5,
                wordNgrams=2,
                verbose=2
            )
            
            # Save model
            model_path = self.intent_classifier.model_path
            model.save_model(model_path)
            
            # Reload model
            await self.intent_classifier.load_model()
            
            logger.info("✅ Intent classifier re-entrenado")
            
        except Exception as e:
            logger.error(f"Error re-entrenando intent classifier: {e}")
    
    async def _archive_training_data(self):
        """Archiva datos de entrenamiento usados"""
        
        try:
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            archive_path = self.training_dir / f"training_data_{timestamp}.txt"
            
            if self.training_data.exists():
                self.training_data.rename(archive_path)
                logger.info(f"Datos archivados en {archive_path}")
                
        except Exception as e:
            logger.error(f"Error archivando datos: {e}")
    
    async def get_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del entrenamiento"""
        
        total_samples = await self._count_training_samples()
        
        return {
            "total_samples": total_samples,
            "min_samples_for_train": self.min_samples,
            "auto_train_enabled": self.auto_train_enabled,
            "ready_for_training": total_samples >= self.min_samples
        }
