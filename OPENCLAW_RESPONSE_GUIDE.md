
# 📖 Guía de Respuestas de David (OpenClaw v2.0)

Este documento detalla cómo responde el bot David ante diferentes consultas para asegurar que la inteligencia artificial está operando correctamente.

## 🤝 Saludos y Charla General
| Usuario pregunta | Comportamiento esperado | Lógica aplicada |
|-----------------|-------------------------|-----------------|
| "Hola", "Buenas" | David responde: "¡Hola! soy David, tu asesor virtual..." | `Greeting Strategy` (Respuesta instantánea) |
| "¿Cómo estás?" | David responde amablemente y pregunta qué buscas. | `Greeting Strategy` |
| "así" | David lo trata como un saludo informal o inicio de charla. | `Greeting Strategy` |

## 📦 Búsqueda de Productos
| Usuario pregunta | Comportamiento esperado | Lógica aplicada |
|-----------------|-------------------------|-----------------|
| "¿Qué tienes?", "productos" | Muestra una lista de categorías con emojis y números. | `list_products_by_category` |
| "Busco cursos", "software" | Muestra una lista de 4-5 productos de esa categoría. | `list_products_by_category` |
| "Mega Pack 11" | Muestra la **CARD Profesional** con precio, links y descripción. | `get_product_with_payment` |
| "Busco algo para trabajar" | David pregunta: "¿Qué tipo de trabajo? (oficina, diseño, etc?)" | `AIDA Qualification` |

## 💳 Pagos y Cierre
| Usuario pregunta | Comportamiento esperado | Lógica aplicada |
|-----------------|-------------------------|-----------------|
| "¿Cómo pago?", "pago" | Muestra los datos de **BBVA, Nequi** y links de pago. | `get_payment_info` |
| "Lo quiero", "Comprar" | Pide confirmación y muestra los medios de pago. | `pago` stage |
| "Datos para el envío" | Enumera: Nombre, Cédula, Ciudad, Dirección, Teléfono. | `confirmacion` stage |

## 📍 Ubicación y Otros
| Usuario pregunta | Comportamiento esperado | Lógica aplicada |
|-----------------|-------------------------|-----------------|
| "¿Dónde están?", "Cali?" | CC El Diamante 2, Local 158, Cali. | `Soul Rules` |
| "¿Tienen horario?" | "Consultar disponibilidad por WhatsApp (+57 304 274 8687)". | `Soul Rules` |

---
**Nota técnica**: David ahora utiliza **Llama 3.3 70B** para razonar. Si el sistema falla o hay saturación, David usará un mensaje de respaldo automático para no quedarse callado.
