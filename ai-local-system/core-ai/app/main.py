"""
Core AI Service - Main FastAPI Application
Sistema de IA Local para Tecnovariedades D&S
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
import os

from .intent import IntentClassifier
from .embeddings import EmbeddingService
from .retriever import KnowledgeRetriever
from .rules import RulesEngine
from .llm import MiniLLMService
from .templates import TemplateEngine
from .context import ConversationContext
from .training import AutoTrainer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Tecnovariedades AI Core",
    description="Sistema de IA Local para ventas y servicios",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global services (initialized on startup)
intent_classifier: Optional[IntentClassifier] = None
embedding_service: Optional[EmbeddingService] = None
knowledge_retriever: Optional[KnowledgeRetriever] = None
rules_engine: Optional[RulesEngine] = None
mini_llm: Optional[MiniLLMService] = None
template_engine: Optional[TemplateEngine] = None
conversation_context: Optional[ConversationContext] = None
auto_trainer: Optional[AutoTrainer] = None


# Request/Response Models
class QueryRequest(BaseModel):
    user_id: str = Field(..., description="ID del usuario (número de WhatsApp)")
    text: str = Field(..., description="Mensaje del usuario")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Contexto adicional")
    session_id: Optional[str] = Field(default=None, description="ID de sesión")


class QueryResponse(BaseModel):
    intent: str = Field(..., description="Intención detectada")
    confidence: float = Field(..., description="Confianza de la intención (0-1)")
    reply: str = Field(..., description="Respuesta generada")
    actions: Optional[Dict[str, Any]] = Field(default=None, description="Acciones a ejecutar")
    retrieved_docs: Optional[List[Dict]] = Field(default=None, description="Documentos recuperados")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Metadata adicional")


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, bool]


class TrainingRequest(BaseModel):
    conversation_id: str
    messages: List[Dict[str, str]]
    outcome: str  # success, failure, escalated
    feedback: Optional[str] = None


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize all AI services on startup"""
    global intent_classifier, embedding_service, knowledge_retriever
    global rules_engine, mini_llm, template_engine, conversation_context, auto_trainer
    
    logger.info("🚀 Iniciando Core AI Service...")
    
    try:
        # 1. Intent Classifier
        logger.info("📊 Cargando Intent Classifier...")
        intent_classifier = IntentClassifier()
        await intent_classifier.load_model()
        
        # 2. Embedding Service
        logger.info("🔤 Cargando Embedding Service...")
        embedding_service = EmbeddingService()
        await embedding_service.load_model()
        
        # 3. Knowledge Retriever
        logger.info("📚 Inicializando Knowledge Retriever...")
        knowledge_retriever = KnowledgeRetriever(embedding_service)
        await knowledge_retriever.initialize()
        
        # 4. Rules Engine
        logger.info("⚙️ Cargando Rules Engine...")
        rules_engine = RulesEngine()
        await rules_engine.load_rules()
        
        # 5. Mini-LLM
        logger.info("🧠 Cargando Mini-LLM...")
        mini_llm = MiniLLMService()
        await mini_llm.load_model()
        
        # 6. Template Engine
        logger.info("📝 Inicializando Template Engine...")
        template_engine = TemplateEngine()
        await template_engine.load_templates()
        
        # 7. Conversation Context
        logger.info("💬 Inicializando Conversation Context...")
        conversation_context = ConversationContext()
        
        # 8. Auto Trainer
        logger.info("🎓 Inicializando Auto Trainer...")
        auto_trainer = AutoTrainer(
            intent_classifier=intent_classifier,
            embedding_service=embedding_service,
            knowledge_retriever=knowledge_retriever
        )
        
        logger.info("✅ Core AI Service iniciado correctamente")
        
    except Exception as e:
        logger.error(f"❌ Error al iniciar servicios: {e}")
        raise


# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    services_status = {
        "intent_classifier": intent_classifier is not None and intent_classifier.is_loaded(),
        "embedding_service": embedding_service is not None and embedding_service.is_loaded(),
        "knowledge_retriever": knowledge_retriever is not None and knowledge_retriever.is_ready(),
        "rules_engine": rules_engine is not None,
        "mini_llm": mini_llm is not None and mini_llm.is_loaded(),
        "template_engine": template_engine is not None,
    }
    
    all_healthy = all(services_status.values())
    
    return HealthResponse(
        status="healthy" if all_healthy else "degraded",
        timestamp=datetime.utcnow().isoformat(),
        services=services_status
    )


# Main query endpoint
@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest, background_tasks: BackgroundTasks):
    """
    Procesa una consulta del usuario y genera una respuesta inteligente
    
    Pipeline:
    1. Detectar intención
    2. Recuperar contexto de conversación
    3. Si es transaccional → Rules Engine
    4. Si es informativo → RAG + Retrieval
    5. Reescribir con Mini-LLM
    6. Generar respuesta final
    """
    
    try:
        logger.info(f"📥 Query recibida de {request.user_id}: {request.text[:50]}...")
        
        # 1. Detect Intent
        intent_result = await intent_classifier.predict(request.text)
        intent = intent_result["intent"]
        confidence = intent_result["confidence"]
        
        logger.info(f"🎯 Intent detectado: {intent} (confidence: {confidence:.2f})")
        
        # 2. Get conversation context
        context = conversation_context.get_context(request.user_id)
        context.update(request.context or {})
        
        # 3. Determine processing path
        if rules_engine.is_transactional(intent):
            # Transactional path (compra, cita, fiado, etc)
            logger.info("💰 Procesando con Rules Engine (transaccional)")
            result = await rules_engine.process(
                intent=intent,
                text=request.text,
                user_id=request.user_id,
                context=context
            )
            
            reply = result["reply"]
            actions = result.get("actions", {})
            retrieved_docs = []
            
        else:
            # Informational path (preguntas, info productos, etc)
            logger.info("📚 Procesando con RAG (informativo)")
            
            # Retrieve relevant documents
            retrieved_docs = await knowledge_retriever.retrieve(
                query=request.text,
                top_k=5,
                filters={"intent": intent}
            )
            
            # Generate response with Mini-LLM
            llm_input = {
                "intent": intent,
                "query": request.text,
                "context": context,
                "retrieved_docs": retrieved_docs
            }
            
            llm_response = await mini_llm.generate(llm_input)
            reply = llm_response["text"]
            actions = llm_response.get("actions", {})
        
        # 4. Apply template formatting
        final_reply = await template_engine.format(
            text=reply,
            intent=intent,
            context=context
        )
        
        # 5. Update conversation context
        conversation_context.add_message(
            user_id=request.user_id,
            role="user",
            content=request.text
        )
        conversation_context.add_message(
            user_id=request.user_id,
            role="assistant",
            content=final_reply
        )
        
        # 6. Log for training (background task)
        background_tasks.add_task(
            log_interaction,
            user_id=request.user_id,
            query=request.text,
            intent=intent,
            confidence=confidence,
            response=final_reply
        )
        
        logger.info(f"✅ Respuesta generada para {request.user_id}")
        
        return QueryResponse(
            intent=intent,
            confidence=confidence,
            reply=final_reply,
            actions=actions,
            retrieved_docs=[{"id": d["id"], "score": d["score"]} for d in retrieved_docs],
            metadata={
                "processing_path": "transactional" if rules_engine.is_transactional(intent) else "informational",
                "context_length": len(context),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"❌ Error procesando query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Training endpoint
@app.post("/train")
async def train_from_conversation(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Entrena el sistema con una conversación completa"""
    
    try:
        logger.info(f"🎓 Recibida solicitud de entrenamiento: {request.conversation_id}")
        
        # Add training task to background
        background_tasks.add_task(
            auto_trainer.train_from_conversation,
            conversation_id=request.conversation_id,
            messages=request.messages,
            outcome=request.outcome,
            feedback=request.feedback
        )
        
        return {"status": "training_queued", "conversation_id": request.conversation_id}
        
    except Exception as e:
        logger.error(f"❌ Error en entrenamiento: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Reindex knowledge base
@app.post("/reindex")
async def reindex_knowledge_base(background_tasks: BackgroundTasks):
    """Re-indexa la base de conocimiento"""
    
    try:
        logger.info("🔄 Iniciando re-indexación de KB...")
        
        background_tasks.add_task(knowledge_retriever.reindex)
        
        return {"status": "reindex_started"}
        
    except Exception as e:
        logger.error(f"❌ Error en re-indexación: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Get stats
@app.get("/stats")
async def get_stats():
    """Obtiene estadísticas del sistema"""
    
    try:
        stats = {
            "intent_classifier": await intent_classifier.get_stats(),
            "knowledge_retriever": await knowledge_retriever.get_stats(),
            "mini_llm": await mini_llm.get_stats(),
            "conversation_context": conversation_context.get_stats(),
            "auto_trainer": await auto_trainer.get_stats()
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Helper functions
async def log_interaction(user_id: str, query: str, intent: str, confidence: float, response: str):
    """Log interaction for training"""
    try:
        await auto_trainer.log_interaction(
            user_id=user_id,
            query=query,
            intent=intent,
            confidence=confidence,
            response=response,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Error logging interaction: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
