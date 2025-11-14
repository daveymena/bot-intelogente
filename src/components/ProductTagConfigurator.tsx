'use client';

/**
 * 🏷️ CONFIGURADOR DE TAGS INTELIGENTES PARA PRODUCTOS
 * Interfaz SaaS fácil de usar para configurar productos con tags automáticos
 */

import React, { useState, useEffect } from 'react';
import { ProductTagService, ProductTagSuggestion, ProductTagConfig } from '@/lib/product-tag-service';

interface ProductTagConfiguratorProps {
  initialProduct?: {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    price?: number;
  };
  onConfigChange?: (config: ProductTagConfig) => void;
  onSave?: (config: ProductTagConfig) => void;
}

export default function ProductTagConfigurator({
  initialProduct,
  onConfigChange,
  onSave
}: ProductTagConfiguratorProps) {
  const [product, setProduct] = useState({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    category: initialProduct?.category || '',
    tags: initialProduct?.tags || [],
    price: initialProduct?.price || 0
  });

  const [suggestions, setSuggestions] = useState<ProductTagSuggestion[]>([]);
  const [generatedConfig, setGeneratedConfig] = useState<ProductTagConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } | null>(null);

  // Generar sugerencias cuando cambie el producto
  useEffect(() => {
    if (product.name.length > 3) {
      generateSuggestions();
    }
  }, [product.name, product.description]);

  // Validar configuración cuando cambien los tags
  useEffect(() => {
    if (generatedConfig) {
      const validationResult = ProductTagService.validateTagConfig(generatedConfig);
      setValidation(validationResult);
      onConfigChange?.(generatedConfig);
    }
  }, [generatedConfig, onConfigChange]);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const newSuggestions = ProductTagService.generateTagSuggestions(product);
      setSuggestions(newSuggestions);

      // Generar configuración completa automáticamente
      const config = ProductTagService.generateProductConfig(product);
      setGeneratedConfig(config);
    } catch (error) {
      console.error('Error generando sugerencias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (!generatedConfig) return;

    const newTags = generatedConfig.tags.includes(tag)
      ? generatedConfig.tags.filter(t => t !== tag)
      : [...generatedConfig.tags, tag];

    setGeneratedConfig({
      ...generatedConfig,
      tags: newTags
    });
  };

  const optimizeTags = () => {
    if (!generatedConfig) return;

    const optimizedTags = ProductTagService.optimizeTags(generatedConfig.tags);
    setGeneratedConfig({
      ...generatedConfig,
      tags: optimizedTags
    });
  };

  const handleSave = () => {
    if (generatedConfig && onSave) {
      onSave(generatedConfig);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🏷️ Configurador Inteligente de Productos
        </h2>
        <p className="text-gray-600">
          Configure su producto fácilmente. El sistema sugerirá tags automáticamente para mejorar la búsqueda.
        </p>
      </div>

      {/* Formulario básico del producto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Producto *
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Curso Completo de Piano"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar categoría...</option>
            <option value="cursos">📚 Cursos</option>
            <option value="musica">🎵 Música</option>
            <option value="idiomas">🗣️ Idiomas</option>
            <option value="diseno">🎨 Diseño</option>
            <option value="programacion">💻 Programación</option>
            <option value="marketing">📢 Marketing</option>
            <option value="fotografia">📸 Fotografía</option>
            <option value="video">🎬 Video</option>
            <option value="negocios">💼 Negocios</option>
            <option value="salud">🏥 Salud</option>
            <option value="tecnologia">⚡ Tecnología</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            value={product.description}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe tu producto para generar mejores sugerencias..."
          />
        </div>
      </div>

      {/* Sugerencias automáticas */}
      {suggestions.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            🎯 Sugerencias Automáticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                <div>
                  <span className="font-medium text-gray-800">{suggestion.tag}</span>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    {Math.round(suggestion.confidence * 100)}% confianza
                  </div>
                  <button
                    onClick={() => handleTagToggle(suggestion.tag)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    {generatedConfig?.tags.includes(suggestion.tag) ? 'Quitar' : 'Agregar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuración generada */}
      {generatedConfig && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              ⚙️ Configuración Generada
            </h3>
            <button
              onClick={optimizeTags}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              ✨ Optimizar Tags
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Categoría Detectada</div>
              <div className="font-medium text-gray-800 capitalize">{generatedConfig.category}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Tags Generados</div>
              <div className="font-medium text-gray-800">{generatedConfig.tags.length}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Prioridad de Búsqueda</div>
              <div className="font-medium text-gray-800">{generatedConfig.searchPriority}/10</div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags del Producto
            </label>
            <div className="flex flex-wrap gap-2">
              {generatedConfig.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Agregar tag manualmente..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleTagToggle(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      )}

      {/* Validación */}
      {validation && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ✅ Validación de Configuración
          </h3>

          {validation.warnings.length > 0 && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-sm font-medium text-yellow-800 mb-2">⚠️ Advertencias:</div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.suggestions.length > 0 && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-sm font-medium text-blue-800 mb-2">💡 Sugerencias:</div>
              <ul className="text-sm text-blue-700 space-y-1">
                {validation.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.isValid && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-sm font-medium text-green-800">
                ✅ Configuración óptima para búsqueda
              </div>
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={generateSuggestions}
          disabled={isLoading || product.name.length < 3}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? '🔄 Generando...' : '🎯 Generar Sugerencias'}
        </button>

        {generatedConfig && onSave && (
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
          >
            💾 Guardar Producto
          </button>
        )}
      </div>

      {/* Información de ayuda */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">💡 Consejos para Mejor Búsqueda:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Use términos específicos que los clientes puedan buscar</li>
          <li>• Incluya el nivel del curso (básico, intermedio, avanzado)</li>
          <li>• Agregue herramientas o software específico que se enseñe</li>
          <li>• Incluya beneficios únicos de su producto</li>
          <li>• Use sinónimos comunes (ej: "photoshop" y "diseño gráfico")</li>
        </ul>
      </div>
    </div>
  );
}