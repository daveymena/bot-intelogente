"""
Embedding Service - Servicio de embeddings usando sentence-transformers
"""

import logging
from typing import List, Union
import numpy as np
from sentence_transformers import SentenceTransformer
import os

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Servicio de embeddings usando MiniLM (ligero y eficiente)
    
    Modelo: all-MiniLM-L6-v2
    - Dimensiones: 384
    - Velocidad: ~3000 sentences/sec en CPU
    - Tamaño: ~80MB
    """
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name or os.getenv(
            "EMBEDDING_MODEL",
            "sentence-transformers/all-MiniLM-L6-v2"
        )
        self.model = None
        self.dimension = 384  # MiniLM dimension
        
    async def load_model(self):
        """Carga el modelo de embeddings"""
        try:
            logger.info(f"Cargando modelo de embeddings: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            self.dimension = self.model.get_sentence_embedding_dimension()
            logger.info(f"✅ Modelo cargado (dim={self.dimension})")
        except Exception as e:
            logger.error(f"Error cargando modelo de embeddings: {e}")
            raise
    
    def is_loaded(self) -> bool:
        """Verifica si el modelo está cargado"""
        return self.model is not None
    
    def encode(
        self,
        texts: Union[str, List[str]],
        normalize: bool = True,
        batch_size: int = 32,
        show_progress: bool = False
    ) -> np.ndarray:
        """
        Genera embeddings para uno o más textos
        
        Args:
            texts: Texto o lista de textos
            normalize: Normalizar embeddings (para cosine similarity)
            batch_size: Tamaño de batch para procesamiento
            show_progress: Mostrar barra de progreso
            
        Returns:
            numpy array de embeddings
        """
        if not self.is_loaded():
            raise RuntimeError("Modelo no cargado. Llama a load_model() primero")
        
        # Convert single string to list
        if isinstance(texts, str):
            texts = [texts]
        
        try:
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=show_progress,
                normalize_embeddings=normalize,
                convert_to_numpy=True
            )
            
            return embeddings
            
        except Exception as e:
            logger.error(f"Error generando embeddings: {e}")
            raise
    
    async def encode_async(
        self,
        texts: Union[str, List[str]],
        normalize: bool = True
    ) -> np.ndarray:
        """Versión async de encode"""
        return self.encode(texts, normalize=normalize)
    
    def similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """
        Calcula similitud coseno entre dos embeddings
        
        Args:
            emb1: Primer embedding
            emb2: Segundo embedding
            
        Returns:
            Similitud coseno (0-1)
        """
        # Normalize if not already
        emb1_norm = emb1 / np.linalg.norm(emb1)
        emb2_norm = emb2 / np.linalg.norm(emb2)
        
        # Cosine similarity
        similarity = np.dot(emb1_norm, emb2_norm)
        
        return float(similarity)
    
    def batch_similarity(
        self,
        query_emb: np.ndarray,
        doc_embs: np.ndarray
    ) -> np.ndarray:
        """
        Calcula similitud entre un query y múltiples documentos
        
        Args:
            query_emb: Embedding del query (1D array)
            doc_embs: Embeddings de documentos (2D array)
            
        Returns:
            Array de similitudes
        """
        # Normalize
        query_norm = query_emb / np.linalg.norm(query_emb)
        doc_norms = doc_embs / np.linalg.norm(doc_embs, axis=1, keepdims=True)
        
        # Batch cosine similarity
        similarities = np.dot(doc_norms, query_norm)
        
        return similarities
    
    async def get_stats(self) -> dict:
        """Obtiene estadísticas del servicio"""
        return {
            "model_name": self.model_name,
            "dimension": self.dimension,
            "loaded": self.is_loaded()
        }
