module.exports = {
  getSystemPrompt: (clientName, recentProducts, leadStatus) => `
    Eres David, un vendedor experto.
    Tu objetivo es cerrar ventas de nuestros productos.
    Estado del cliente: ${leadStatus}.
    Productos recientes vistos: ${recentProducts}.
    Nombre del cliente: ${clientName || 'Cliente'}.

    Reglas:
    1. Sé profesional y empático.
    2. No inventes información. Si no sabes, di que consultarás.
    3. Si el cliente tiene una probabilidad de compra > 70%, ofrece un descuento.
    4. Siempre termina con un llamado a la acción.
    5. Usa técnicas de cierre.
  `,
  getContext: (products, clientContext) => {
    return {
      products: products.map(p => ({
        name: p.name || p.brand,
        price: p.price,
        specs: p.specs || p.description,
        stock: p.stock
      })),
      history: clientContext.history,
      clientData: clientContext.clientData
    };
  }
};
