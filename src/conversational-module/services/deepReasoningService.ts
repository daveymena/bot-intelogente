/**
 * Sistema de Razonamiento Profundo
 * Capa de interpretación inteligente cuando el bot no entiende
 * Actúa como "lógica humana" para interpretar consultas complejas
 */

import { sendWithFallback, type GroqMessage } from '../ai/groqClient';

export interface ReasoningResult {
  interpretacion: string;
  intencionReal: string;
  busquedaSugerida: string;
  confianza: number;
  razonamiento: string;
}

/**
 * Analiza una consulta confusa usando razonamiento profundo
 */
export async function analizarConRazonamientoProfundo(
  mensajeOriginal: string,
  contexto?: string
): Promise<ReasoningResult> {
  try {
    console.log('[DeepReasoning] Analizando mensaje confuso:', mensajeOriginal);

    const prompt = construirPromptRazonamiento(mensajeOriginal, contexto);

    const messages: GroqMessage[] = [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: mensajeOriginal,
      },
    ];

    const respuesta = await sendWithFallback(messages, {
      temperature: 0.3, // Más determinista para razonamiento
      maxTokens: 800,
    });

    // Parsear la respuesta estructurada
    const resultado = parsearRespuestaRazonamiento(respuesta.content);

    console.log('[DeepReasoning] Interpretación:', resultado.interpretacion);
    console.log('[DeepReasoning] Intención real:', resultado.intencionReal);

    return resultado;

  } catch (error) {
    console.error('[DeepReasoning] Error:', error);
    
    // Fallback: análisis básico
    return analizarBasico(mensajeOriginal);
  }
}

/**
 * Construye el prompt para razonamiento profundo
 */
function construirPromptRazonamiento(mensaje: string, contexto?: string): string {
  return `Eres un experto en interpretar intenciones de clientes en un contexto de ventas.

Tu trabajo es RAZONAR como un humano para entender qué está pidiendo realmente el cliente, incluso si:
- Usa jerga o lenguaje coloquial
- Escribe con errores ortográficos
- Es ambiguo o poco claro
- Usa referencias indirectas
- Mezcla varios temas

CONTEXTO DEL NEGOCIO:
- Vendemos: computadores, laptops, motos, cursos digitales, megapacks
- Ubicación: Colombia
- Moneda: Pesos colombianos (COP)

${contexto ? `CONTEXTO DE LA CONVERSACIÓN:\n${contexto}\n` : ''}

PROCESO DE RAZONAMIENTO:
1. Lee el mensaje del cliente
2. Identifica palabras clave y conceptos
3. Infiere la intención real (¿qué quiere realmente?)
4. Traduce a una búsqueda clara
5. Explica tu razonamiento

FORMATO DE RESPUESTA (JSON):
{
  "interpretacion": "Explicación clara de qué entendiste",
  "intencionReal": "comprar|consultar|comparar|pagar|otro",
  "busquedaSugerida": "Términos de búsqueda claros",
  "confianza": 0.0-1.0,
  "razonamiento": "Por qué llegaste a esta conclusión"
}

EJEMPLOS:

Usuario: "ese que sirve para diseñar"
Respuesta:
{
  "interpretacion": "Busca un computador con capacidad para diseño gráfico",
  "intencionReal": "consultar",
  "busquedaSugerida": "computador diseño gráfico",
  "confianza": 0.85,
  "razonamiento": "La frase 'sirve para diseñar' indica necesidad de hardware para diseño. En nuestro catálogo, esto corresponde a computadores con buenas especificaciones gráficas."
}

Usuario: "la que va rápido"
Respuesta:
{
  "interpretacion": "Busca una moto con buena velocidad",
  "intencionReal": "consultar",
  "busquedaSugerida": "moto velocidad deportiva",
  "confianza": 0.75,
  "razonamiento": "El pronombre 'la' sugiere género femenino (moto). 'Va rápido' indica interés en velocidad. Probablemente busca motos deportivas o de alto cilindraje."
}

Usuario: "lo del piano ese"
Respuesta:
{
  "interpretacion": "Pregunta por el curso de piano",
  "intencionReal": "consultar",
  "busquedaSugerida": "curso piano",
  "confianza": 0.9,
  "razonamiento": "Referencia directa a 'piano'. En nuestro catálogo tenemos cursos digitales. 'Lo del' sugiere que ya conoce el producto o lo vio antes."
}

Usuario: "cuanto pa la moto"
Respuesta:
{
  "interpretacion": "Pregunta el precio de una moto",
  "intencionReal": "consultar",
  "busquedaSugerida": "precio moto",
  "confianza": 0.95,
  "razonamiento": "'Cuanto' es jerga para 'cuánto cuesta'. 'Pa' = 'para'. Pregunta directa por precio de moto."
}

Ahora analiza el mensaje del usuario y responde SOLO con el JSON.`;
}

/**
 * Parsea la respuesta del razonamiento
 */
function parsearRespuestaRazonamiento(respuesta: string): ReasoningResult {
  try {
    // Intentar extraer JSON de la respuesta
    const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[0]);
      return {
        interpretacion: json.interpretacion || '',
        intencionReal: json.intencionReal || 'consultar',
        busquedaSugerida: json.busquedaSugerida || '',
        confianza: json.confianza || 0.5,
        razonamiento: json.razonamiento || '',
      };
    }

    // Si no hay JSON, intentar parsear texto
    return parsearTextoLibre(respuesta);

  } catch (error) {
    console.error('[DeepReasoning] Error parseando:', error);
    return parsearTextoLibre(respuesta);
  }
}

/**
 * Parsea respuesta en texto libre
 */
function parsearTextoLibre(texto: string): ReasoningResult {
  return {
    interpretacion: texto.substring(0, 200),
    intencionReal: 'consultar',
    busquedaSugerida: extraerPalabrasClave(texto),
    confianza: 0.5,
    razonamiento: 'Análisis de texto libre',
  };
}

/**
 * Extrae palabras clave de un texto
 */
function extraerPalabrasClave(texto: string): string {
  const palabrasClave = [
    'computador', 'laptop', 'portátil', 'pc',
    'moto', 'motocicleta',
    'curso', 'megapack',
    'diseño', 'gráfico', 'gaming',
    'precio', 'costo', 'pagar',
  ];

  const textoLower = texto.toLowerCase();
  const encontradas = palabrasClave.filter(palabra => 
    textoLower.includes(palabra)
  );

  return encontradas.join(' ') || texto.substring(0, 50);
}

/**
 * Análisis básico sin IA (fallback)
 */
function analizarBasico(mensaje: string): ReasoningResult {
  const textoLower = mensaje.toLowerCase();

  // Detectar categoría
  let categoria = 'general';
  let busqueda = mensaje;

  if (/comput|laptop|pc|portátil/i.test(textoLower)) {
    categoria = 'computador';
    busqueda = 'computador';
  } else if (/moto/i.test(textoLower)) {
    categoria = 'moto';
    busqueda = 'moto';
  } else if (/curso/i.test(textoLower)) {
    categoria = 'curso';
    busqueda = 'curso';
  } else if (/megapack/i.test(textoLower)) {
    categoria = 'megapack';
    busqueda = 'megapack';
  }

  return {
    interpretacion: `Parece que preguntas por ${categoria}`,
    intencionReal: 'consultar',
    busquedaSugerida: busqueda,
    confianza: 0.6,
    razonamiento: 'Análisis básico por palabras clave',
  };
}

/**
 * Detecta si un mensaje necesita razonamiento profundo
 */
export function necesitaRazonamientoProfundo(
  mensaje: string,
  intentosFallidos: number = 0
): boolean {
  // Si ya falló 1+ veces, usar razonamiento profundo
  if (intentosFallidos > 0) {
    return true;
  }

  const textoLower = mensaje.toLowerCase();

  // Mensajes muy cortos y ambiguos
  if (mensaje.length < 10 && !/precio|costo|cuánto/i.test(textoLower)) {
    return true;
  }

  // Mensajes con jerga o coloquialismos
  const patronesJerga = [
    /ese que/i,
    /la que/i,
    /el de/i,
    /lo del/i,
    /pa /i,
    /q /i,
    /xq/i,
    /tmb/i,
  ];

  if (patronesJerga.some(patron => patron.test(textoLower))) {
    return true;
  }

  // Mensajes sin palabras clave claras
  const palabrasClave = [
    'computador', 'laptop', 'moto', 'curso', 'megapack',
    'precio', 'costo', 'pagar', 'comprar',
  ];

  const tienePalabrasClave = palabrasClave.some(palabra =>
    textoLower.includes(palabra)
  );

  if (!tienePalabrasClave && mensaje.length > 5) {
    return true;
  }

  return false;
}

/**
 * Genera respuesta amigable basada en el razonamiento
 */
export function generarRespuestaAmigable(resultado: ReasoningResult): string {
  if (resultado.confianza > 0.7) {
    return `Entiendo, buscas ${resultado.interpretacion.toLowerCase()} 😊

Déjame buscar eso para ti...`;
  } else {
    return `Creo que buscas ${resultado.interpretacion.toLowerCase()}, ¿es correcto? 🤔

Si no es eso, ¿podrías darme más detalles?`;
  }
}
