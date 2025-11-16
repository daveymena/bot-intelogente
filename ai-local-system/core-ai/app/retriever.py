"""
Knowledge Retriever - Sistema RAG con Qdrant
"""

import logging
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import os
import json
from datetime import datetime

from .embeddings import EmbeddingService

logger = logging.getLogger(__name__)


class KnowledgeRetriever:
    """
    Sistema de recuperación de conocimiento usando Qdrant
    
    Colecciones:
    - knowledge_base: FAQs, procedimientos, información general
    - products: Catálogo de productos
    - conversations: Historial de conversaciones exitosas
    """
    
    def __init__(self, embedding_service: EmbeddingService):
        self.embedding_service = embedding_service
        self.qdrant_host = os.getenv("QDRANT_HOST", "localhost")
        self.qdrant_port = int(os.getenv("QDRANT_PORT", "6333"))
        self.client = None
        self.collections = ["knowledge_base", "products", "conversations"]
        
    async def initialize(self):
        """Inicializa conexión con Qdrant y crea colecciones"""
        try:
            logger.info(f"Conectando a Qdrant en {self.qdrant_host}:{self.qdrant_port}")
            self.client = QdrantClient(host=self.qdrant_host, port=self.qdrant_port)
            
            # Create collections if they don't exist
            for collection_name in self.collections:
                await self._ensure_collection(collection_name)
            
            logger.info("✅ Qdrant inicializado correctamente")
            
        except Exception as e:
            logger.error(f"Error inicializando Qdrant: {e}")
            raise
    
    async def _ensure_collection(self, collection_name: str):
        """Crea una colección si no existe"""
        try:
            collections = self.client.get_collections().collections
            collection_names = [c.name for c in collections]
            
            if collection_name not in collection_names:
                logger.info(f"Creando colección: {collection_name}")
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=self.embedding_service.dimension,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"✅ Colección {collection_name} creada")
            else:
                logger.info(f"Colección {collection_name} ya existe")
                
        except Exception as e:
            logger.error(f"Error creando colección {collection_name}: {e}")
            raise
    
    def is_ready(self) -> bool:
        """Verifica si el retriever está listo"""
        return self.client is not None
    
    async def retrieve(
        self,
        query: str,
        top_k: int = 5,
        collection: str = "knowledge_base",
        filters: Optional[Dict[str, Any]] = None,
        score_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Recupera documentos relevantes para una query
        
        Args:
            query: Texto de búsqueda
            top_k: Número de resultados
            collection: Colección a buscar
            filters: Filtros adicionales
            score_threshold: Umbral mínimo de score
            
        Returns:
            Lista de documentos con scores
        """
        try:
            # Generate query embedding
            query_emb = self.embedding_service.encode(query, normalize=True)
            
            # Build filter if provided
            query_filter = None
            if filters:
                conditions = []
                for key, value in filters.items():
                    conditions.append(
                        FieldCondition(
                            key=key,
                            match=MatchValue(value=value)
                        )
                    )
                if conditions:
                    query_filter = Filter(must=conditions)
            
            # Search in Qdrant
            search_result = self.client.search(
                collection_name=collection,
                query_vector=query_emb.tolist(),
                limit=top_k,
                query_filter=query_filter,
                score_threshold=score_threshold
            )
            
            # Format results
            results = []
            for hit in search_result:
                results.append({
                    "id": hit.id,
                    "score": hit.score,
                    "text": hit.payload.get("text", ""),
                    "metadata": hit.payload.get("metadata", {}),
                    **hit.payload
                })
            
            logger.info(f"Recuperados {len(results)} documentos para query: {query[:50]}...")
            
            return results
            
        except Exception as e:
            logger.error(f"Error en retrieve: {e}")
            return []
    
    async def add_document(
        self,
        text: str,
        collection: str = "knowledge_base",
        metadata: Optional[Dict[str, Any]] = None,
        doc_id: Optional[str] = None
    ) -> str:
        """
        Agrega un documento a la base de conocimiento
        
        Args:
            text: Texto del documento
            collection: Colección destino
            metadata: Metadata adicional
            doc_id: ID del documento (opcional)
            
        Returns:
            ID del documento agregado
        """
        try:
            # Generate embedding
            embedding = self.embedding_service.encode(text, normalize=True)
            
            # Generate ID if not provided
            if doc_id is None:
                doc_id = f"{collection}_{datetime.utcnow().timestamp()}"
            
            # Prepare payload
            payload = {
                "text": text,
                "metadata": metadata or {},
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Add to Qdrant
            self.client.upsert(
                collection_name=collection,
                points=[
                    PointStruct(
                        id=doc_id,
                        vector=embedding.tolist(),
                        payload=payload
                    )
                ]
            )
            
            logger.info(f"Documento agregado: {doc_id}")
            
            return doc_id
            
        except Exception as e:
            logger.error(f"Error agregando documento: {e}")
            raise
    
    async def add_documents_batch(
        self,
        documents: List[Dict[str, Any]],
        collection: str = "knowledge_base",
        batch_size: int = 100
    ) -> int:
        """
        Agrega múltiples documentos en batch
        
        Args:
            documents: Lista de documentos con 'text' y opcionalmente 'metadata' e 'id'
            collection: Colección destino
            batch_size: Tamaño de batch
            
        Returns:
            Número de documentos agregados
        """
        try:
            total_added = 0
            
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                
                # Extract texts
                texts = [doc["text"] for doc in batch]
                
                # Generate embeddings
                embeddings = self.embedding_service.encode(texts, normalize=True, show_progress=True)
                
                # Prepare points
                points = []
                for j, doc in enumerate(batch):
                    doc_id = doc.get("id", f"{collection}_{datetime.utcnow().timestamp()}_{i+j}")
                    payload = {
                        "text": doc["text"],
                        "metadata": doc.get("metadata", {}),
                        "created_at": datetime.utcnow().isoformat()
                    }
                    
                    points.append(
                        PointStruct(
                            id=doc_id,
                            vector=embeddings[j].tolist(),
                            payload=payload
                        )
                    )
                
                # Upsert batch
                self.client.upsert(
                    collection_name=collection,
                    points=points
                )
                
                total_added += len(batch)
                logger.info(f"Batch {i//batch_size + 1}: {len(batch)} documentos agregados")
            
            logger.info(f"✅ Total: {total_added} documentos agregados a {collection}")
            
            return total_added
            
        except Exception as e:
            logger.error(f"Error en add_documents_batch: {e}")
            raise
    
    async def reindex(self):
        """Re-indexa toda la base de conocimiento"""
        try:
            logger.info("🔄 Iniciando re-indexación...")
            
            # Load KB from files
            kb_path = "/data/kb"
            if not os.path.exists(kb_path):
                logger.warning(f"Directorio KB no encontrado: {kb_path}")
                return
            
            # Process each JSON file in KB directory
            for filename in os.listdir(kb_path):
                if filename.endswith(".json"):
                    filepath = os.path.join(kb_path, filename)
                    logger.info(f"Procesando: {filename}")
                    
                    with open(filepath, 'r', encoding='utf-8') as f:
                        documents = json.load(f)
                    
                    # Determine collection from filename
                    if "product" in filename.lower():
                        collection = "products"
                    elif "conversation" in filename.lower():
                        collection = "conversations"
                    else:
                        collection = "knowledge_base"
                    
                    # Add documents
                    await self.add_documents_batch(documents, collection=collection)
            
            logger.info("✅ Re-indexación completada")
            
        except Exception as e:
            logger.error(f"Error en reindex: {e}")
            raise
    
    async def get_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas del retriever"""
        try:
            stats = {}
            
            for collection_name in self.collections:
                try:
                    collection_info = self.client.get_collection(collection_name)
                    stats[collection_name] = {
                        "points_count": collection_info.points_count,
                        "vectors_count": collection_info.vectors_count
                    }
                except Exception as e:
                    stats[collection_name] = {"error": str(e)}
            
            return stats
            
        except Exception as e:
            logger.error(f"Error obteniendo stats: {e}")
            return {}
