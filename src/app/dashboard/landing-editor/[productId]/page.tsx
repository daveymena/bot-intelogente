'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Wand2, Eye, Save, ArrowLeft } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
}

interface LandingPageContent {
  headline: string;
  subheadline: string;
  benefits: string[];
  cta: string;
  urgency: string;
  testimonial?: string;
}

export default function LandingEditorPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [content, setContent] = useState<LandingPageContent>({
    headline: '',
    subheadline: '',
    benefits: ['', '', ''],
    cta: '',
    urgency: '',
    testimonial: ''
  });

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        
        // Cargar landing page existente si hay
        if (data.landingPageContent) {
          setContent(JSON.parse(data.landingPageContent));
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWithAI = async () => {
    if (!product) return;
    
    setGenerating(true);
    try {
      const res = await fetch('/api/landing-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          description: product.description,
          price: product.price,
          category: product.category
        })
      });

      if (res.ok) {
        const generated = await res.json();
        setContent(generated.content);
      }
    } catch (error) {
      console.error('Error generating landing page:', error);
    } finally {
      setGenerating(false);
    }
  };

  const saveLandingPage = async () => {
    if (!product) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landingPageContent: JSON.stringify(content)
        })
      });

      if (res.ok) {
        alert('Landing page guardada exitosamente');
      }
    } catch (error) {
      console.error('Error saving landing page:', error);
    } finally {
      setSaving(false);
    }
  };

  const previewLandingPage = () => {
    window.open(`/landing/${productId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <p>Producto no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editor de Landing Page
              </h1>
              <p className="text-gray-600 mt-2">
                {product.name}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={generateWithAI}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generar con IA
                  </>
                )}
              </Button>
              
              <Button
                onClick={previewLandingPage}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
              
              <Button
                onClick={saveLandingPage}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Titular Principal</h2>
              <Input
                value={content.headline}
                onChange={(e) => setContent({ ...content, headline: e.target.value })}
                placeholder="Ej: Transforma tu vida con este curso"
                className="text-lg"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Subtítulo</h2>
              <Textarea
                value={content.subheadline}
                onChange={(e) => setContent({ ...content, subheadline: e.target.value })}
                placeholder="Descripción breve y atractiva"
                rows={3}
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Beneficios Clave</h2>
              {content.benefits.map((benefit, index) => (
                <Input
                  key={index}
                  value={benefit}
                  onChange={(e) => {
                    const newBenefits = [...content.benefits];
                    newBenefits[index] = e.target.value;
                    setContent({ ...content, benefits: newBenefits });
                  }}
                  placeholder={`Beneficio ${index + 1}`}
                  className="mb-3"
                />
              ))}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Llamado a la Acción</h2>
              <Input
                value={content.cta}
                onChange={(e) => setContent({ ...content, cta: e.target.value })}
                placeholder="Ej: ¡Compra Ahora!"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Mensaje de Urgencia</h2>
              <Input
                value={content.urgency}
                onChange={(e) => setContent({ ...content, urgency: e.target.value })}
                placeholder="Ej: ¡Oferta por tiempo limitado!"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Testimonio (Opcional)</h2>
              <Textarea
                value={content.testimonial || ''}
                onChange={(e) => setContent({ ...content, testimonial: e.target.value })}
                placeholder="Testimonio de cliente satisfecho"
                rows={4}
              />
            </Card>
          </div>

          {/* Vista Previa */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="p-8 bg-white">
              <h2 className="text-2xl font-bold mb-6 text-center">Vista Previa</h2>
              
              <div className="space-y-6">
                {/* Imagen */}
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                {/* Headline */}
                <h1 className="text-4xl font-bold text-gray-900 text-center">
                  {content.headline || 'Tu titular aquí'}
                </h1>

                {/* Subheadline */}
                <p className="text-xl text-gray-600 text-center">
                  {content.subheadline || 'Tu subtítulo aquí'}
                </p>

                {/* Precio */}
                <div className="text-center">
                  <p className="text-5xl font-bold text-green-600">
                    ${product.price.toLocaleString('es-CO')}
                  </p>
                  <p className="text-gray-500 mt-2">COP</p>
                </div>

                {/* Beneficios */}
                <div className="space-y-3">
                  {content.benefits.filter(b => b).map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button className="w-full py-6 text-xl bg-green-600 hover:bg-green-700">
                  {content.cta || '¡Compra Ahora!'}
                </Button>

                {/* Urgencia */}
                {content.urgency && (
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 font-semibold">
                      {content.urgency}
                    </p>
                  </div>
                )}

                {/* Testimonio */}
                {content.testimonial && (
                  <div className="bg-gray-50 rounded-lg p-6 italic">
                    <p className="text-gray-700">"{content.testimonial}"</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
