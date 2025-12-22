'use client';

/**
 * 📦 PÁGINA PARA CREAR PRODUCTOS CON CONFIGURACIÓN INTELIGENTE
 * Interfaz SaaS fácil para que los clientes configuren sus productos
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductTagConfigurator from '@/components/ProductTagConfigurator';
import { ProductTagConfig } from '@/lib/product-tag-service';

export default function NewProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProduct = async (config: ProductTagConfig) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // Aquí iría la lógica para guardar el producto en la base de datos
      // Por ahora simulamos el guardado
      console.log('Guardando producto:', config);

      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSaveMessage({
        type: 'success',
        text: `✅ Producto "${config.name}" guardado exitosamente con ${config.tags.length} tags configurados.`
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);

    } catch (error) {
      console.error('Error guardando producto:', error);
      setSaveMessage({
        type: 'error',
        text: '❌ Error al guardar el producto. Por favor intenta de nuevo.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📦 Crear Nuevo Producto
              </h1>
              <p className="mt-2 text-gray-600">
                Configure su producto con tags inteligentes para una mejor búsqueda automática
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/products')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Mensaje de guardado */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-md ${
            saveMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium">{saveMessage.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Configurador */}
        <ProductTagConfigurator
          onSave={handleSaveProduct}
        />

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Búsqueda Inteligente</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Los tags configurados permiten que su bot encuentre este producto automáticamente cuando los clientes pregunten.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚡</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Configuración Automática</h3>
                <p className="mt-1 text-sm text-gray-500">
                  El sistema analiza su producto y sugiere la mejor configuración de tags automáticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Mejor Visibilidad</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Productos bien configurados aparecen primero en las búsquedas y generan más ventas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            ❓ Preguntas Frecuentes
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">¿Qué son los tags?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Los tags son palabras clave que describen su producto. Cuando un cliente pregunta por algo, el bot busca productos que tengan tags relacionados.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">¿Por qué es importante configurar bien los tags?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Una buena configuración de tags asegura que su producto aparezca cuando los clientes busquen términos relacionados, aumentando las ventas.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">¿Puedo editar los tags después?</h4>
              <p className="text-gray-600 text-sm mt-1">
                Sí, puede editar los tags en cualquier momento desde la página de administración de productos.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900">¿Qué pasa si no configuro tags?</h4>
              <p className="text-gray-600 text-sm mt-1">
                El bot aún podrá encontrar su producto por nombre y descripción, pero será menos preciso y podría no aparecer en búsquedas relacionadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}