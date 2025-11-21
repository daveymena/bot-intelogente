"use strict";
/**
 * Módulo Conversacional Smart Sales Bot Pro
 * Punto de entrada principal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarRespuestaAmigable = exports.necesitaRazonamientoProfundo = exports.analizarConRazonamientoProfundo = exports.transcribirAudio = exports.procesarAudio = exports.tienefotos = exports.detectarSolicitudFotos = exports.obtenerFotosProducto = exports.generarLinkMercadoPago = exports.formatearLinksPago = exports.generarLinksPago = exports.LocalResponseStats = exports.tryLocalResponse = exports.sendWithFallback = exports.limpiarContexto = exports.actualizarContexto = exports.obtenerContexto = exports.extraerEntidades = exports.detectarIntencion = exports.reiniciarEstadisticas = exports.obtenerEstadisticas = exports.procesarMensaje = void 0;
var conversacionController_1 = require("./ai/conversacionController");
Object.defineProperty(exports, "procesarMensaje", { enumerable: true, get: function () { return conversacionController_1.procesarMensaje; } });
Object.defineProperty(exports, "obtenerEstadisticas", { enumerable: true, get: function () { return conversacionController_1.obtenerEstadisticas; } });
Object.defineProperty(exports, "reiniciarEstadisticas", { enumerable: true, get: function () { return conversacionController_1.reiniciarEstadisticas; } });
var detectarIntencion_1 = require("./utils/detectarIntencion");
Object.defineProperty(exports, "detectarIntencion", { enumerable: true, get: function () { return detectarIntencion_1.detectarIntencion; } });
Object.defineProperty(exports, "extraerEntidades", { enumerable: true, get: function () { return detectarIntencion_1.extraerEntidades; } });
var obtenerContexto_1 = require("./utils/obtenerContexto");
Object.defineProperty(exports, "obtenerContexto", { enumerable: true, get: function () { return obtenerContexto_1.obtenerContexto; } });
Object.defineProperty(exports, "actualizarContexto", { enumerable: true, get: function () { return obtenerContexto_1.actualizarContexto; } });
Object.defineProperty(exports, "limpiarContexto", { enumerable: true, get: function () { return obtenerContexto_1.limpiarContexto; } });
var groqClient_1 = require("./ai/groqClient");
Object.defineProperty(exports, "sendWithFallback", { enumerable: true, get: function () { return groqClient_1.sendWithFallback; } });
var localResponseHandler_1 = require("./utils/localResponseHandler");
Object.defineProperty(exports, "tryLocalResponse", { enumerable: true, get: function () { return localResponseHandler_1.tryLocalResponse; } });
Object.defineProperty(exports, "LocalResponseStats", { enumerable: true, get: function () { return localResponseHandler_1.LocalResponseStats; } });
// Servicios integrados
var paymentService_1 = require("./services/paymentService");
Object.defineProperty(exports, "generarLinksPago", { enumerable: true, get: function () { return paymentService_1.generarLinksPago; } });
Object.defineProperty(exports, "formatearLinksPago", { enumerable: true, get: function () { return paymentService_1.formatearLinksPago; } });
Object.defineProperty(exports, "generarLinkMercadoPago", { enumerable: true, get: function () { return paymentService_1.generarLinkMercadoPago; } });
var photoService_1 = require("./services/photoService");
Object.defineProperty(exports, "obtenerFotosProducto", { enumerable: true, get: function () { return photoService_1.obtenerFotosProducto; } });
Object.defineProperty(exports, "detectarSolicitudFotos", { enumerable: true, get: function () { return photoService_1.detectarSolicitudFotos; } });
Object.defineProperty(exports, "tienefotos", { enumerable: true, get: function () { return photoService_1.tienefotos; } });
var audioService_1 = require("./services/audioService");
Object.defineProperty(exports, "procesarAudio", { enumerable: true, get: function () { return audioService_1.procesarAudio; } });
Object.defineProperty(exports, "transcribirAudio", { enumerable: true, get: function () { return audioService_1.transcribirAudio; } });
var deepReasoningService_1 = require("./services/deepReasoningService");
Object.defineProperty(exports, "analizarConRazonamientoProfundo", { enumerable: true, get: function () { return deepReasoningService_1.analizarConRazonamientoProfundo; } });
Object.defineProperty(exports, "necesitaRazonamientoProfundo", { enumerable: true, get: function () { return deepReasoningService_1.necesitaRazonamientoProfundo; } });
Object.defineProperty(exports, "generarRespuestaAmigable", { enumerable: true, get: function () { return deepReasoningService_1.generarRespuestaAmigable; } });
