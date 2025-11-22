export class ImageAnalysisService {
  static async analyzeCaption(caption: string): Promise<string> {
    const msg = caption.toLowerCase().trim();
    if (!msg) {
      return 'Recibí tu imagen. ¿Qué te gustaría que analicemos o confirmemos sobre ella?';
    }
    if (/reparaci[oó]n|reparar|arreglar|arreglo|mantenimiento|formatear|instalar|no funciona|da[ñn]ado/.test(msg)) {
      return 'Veo que enviaste una imagen relacionada con tu equipo. ¿Qué marca y modelo es y qué problema presenta exactamente?';
    }
    if (/agendar|cita|agenda|reservar|visita/.test(msg)) {
      return '¿Qué producto o servicio quieres ver y qué día te gustaría venir?';
    }
    if (/laptop|computador|pc|portatil|portátil|celular|consola|moto|producto|curso/.test(msg)) {
      return 'Gracias por la imagen. ¿Deseas información, precio o disponibilidad de lo que se muestra?';
    }
    return 'Gracias por la imagen. ¿Qué te gustaría que verifique o haga con esta foto?';
  }
}