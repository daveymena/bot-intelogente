"use strict";
// 🤖 Sistema Multi-Provider de IA con Fallback Automático
// Si una API falla, automáticamente usa las otras
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIMultiProvider = void 0;
var groq_sdk_1 = __importDefault(require("groq-sdk"));
var AIMultiProvider = /** @class */ (function () {
    function AIMultiProvider() {
    }
    // Inicializar clientes
    AIMultiProvider.initGroq = function () {
        if (!this.groqClient && process.env.GROQ_API_KEY) {
            this.groqClient = new groq_sdk_1.default({
                apiKey: process.env.GROQ_API_KEY
            });
        }
        return this.groqClient;
    };
    // Inicializar OpenRouter (usa fetch, no necesita cliente especial)
    AIMultiProvider.hasOpenRouter = function () {
        return !!process.env.OPENROUTER_API_KEY;
    };
    // 🎯 Método principal: Intenta con todas las APIs hasta que una funcione
    AIMultiProvider.generateCompletion = function (messages_1) {
        return __awaiter(this, arguments, void 0, function (messages, options) {
            var fallbackOrderEnv, fallbackOrder, _i, fallbackOrder_1, provider, response, _a, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fallbackOrderEnv = process.env.AI_FALLBACK_ORDER || 'openrouter,groq,lmstudio';
                        fallbackOrder = fallbackOrderEnv.split(',').map(function (p) { return p.trim(); });
                        console.log("[AI Multi-Provider] \uD83D\uDD04 Orden de fallback: ".concat(fallbackOrder.join(' → ')));
                        _i = 0, fallbackOrder_1 = fallbackOrder;
                        _b.label = 1;
                    case 1:
                        if (!(_i < fallbackOrder_1.length)) return [3 /*break*/, 17];
                        provider = fallbackOrder_1[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 15, , 16]);
                        console.log("[AI Multi-Provider] \uD83D\uDD04 Intentando con: ".concat(provider));
                        response = null;
                        _a = provider.trim().toLowerCase();
                        switch (_a) {
                            case 'openrouter': return [3 /*break*/, 3];
                            case 'groq': return [3 /*break*/, 5];
                            case 'lmstudio': return [3 /*break*/, 7];
                            case 'openai': return [3 /*break*/, 9];
                            case 'ollama': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 3: return [4 /*yield*/, this.tryOpenRouter(messages, options)];
                    case 4:
                        response = _b.sent();
                        return [3 /*break*/, 14];
                    case 5: return [4 /*yield*/, this.tryGroq(messages, options)];
                    case 6:
                        response = _b.sent();
                        return [3 /*break*/, 14];
                    case 7: return [4 /*yield*/, this.tryLMStudio(messages, options)];
                    case 8:
                        response = _b.sent();
                        return [3 /*break*/, 14];
                    case 9: return [4 /*yield*/, this.tryOpenAI(messages, options)];
                    case 10:
                        response = _b.sent();
                        return [3 /*break*/, 14];
                    case 11: return [4 /*yield*/, this.tryOllama(messages, options)];
                    case 12:
                        response = _b.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        console.log("[AI Multi-Provider] \u26A0\uFE0F Provider desconocido: ".concat(provider));
                        return [3 /*break*/, 16];
                    case 14:
                        if (response && response.success) {
                            console.log("[AI Multi-Provider] \u2705 \u00C9xito con: ".concat(provider));
                            return [2 /*return*/, response];
                        }
                        return [3 /*break*/, 16];
                    case 15:
                        error_1 = _b.sent();
                        console.error("[AI Multi-Provider] \u274C Error con ".concat(provider, ":"), error_1.message);
                        // Continuar con el siguiente provider
                        return [3 /*break*/, 16];
                    case 16:
                        _i++;
                        return [3 /*break*/, 1];
                    case 17: 
                    // Si todos fallaron, lanzar error
                    throw new Error('Todas las APIs de IA fallaron. Verifica tu configuración.');
                }
            });
        });
    };
    // 🌐 OpenRouter API (Acceso a múltiples modelos)
    AIMultiProvider.tryOpenRouter = function (messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var apiKey, model, timeout, controller, timeoutId, response, errorText, data, content, error_2;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.hasOpenRouter()) {
                            throw new Error('OpenRouter no configurado (falta OPENROUTER_API_KEY)');
                        }
                        apiKey = process.env.OPENROUTER_API_KEY;
                        model = options.model || process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
                        timeout = 30000 // 30 segundos
                        ;
                        console.log("[OpenRouter] Usando modelo: ".concat(model));
                        controller = new AbortController();
                        timeoutId = setTimeout(function () { return controller.abort(); }, timeout);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch('https://openrouter.ai/api/v1/chat/completions', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(apiKey),
                                    'Content-Type': 'application/json',
                                    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
                                    'X-Title': 'Tecnovariedades D&S Bot'
                                },
                                body: JSON.stringify({
                                    model: model,
                                    messages: messages,
                                    temperature: options.temperature || 0.7,
                                    max_tokens: options.max_tokens || 500,
                                    top_p: options.top_p || 1
                                }),
                                signal: controller.signal
                            })];
                    case 2:
                        response = _d.sent();
                        clearTimeout(timeoutId);
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorText = _d.sent();
                        console.error("[OpenRouter] Error response:", errorText);
                        throw new Error("OpenRouter HTTP ".concat(response.status, ": ").concat(response.statusText));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _d.sent();
                        content = (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
                        if (!content) {
                            throw new Error('OpenRouter no devolvió contenido');
                        }
                        return [2 /*return*/, {
                                content: content,
                                provider: 'openrouter',
                                model: data.model || model,
                                success: true
                            }];
                    case 6:
                        error_2 = _d.sent();
                        clearTimeout(timeoutId);
                        if (error_2.name === 'AbortError') {
                            throw new Error('OpenRouter timeout');
                        }
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // 🚀 Groq API (Principal)
    AIMultiProvider.tryGroq = function (messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var client, model, timeout, completionPromise, timeoutPromise, completion, content;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        client = this.initGroq();
                        if (!client) {
                            throw new Error('Groq no configurado (falta GROQ_API_KEY)');
                        }
                        model = options.model || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
                        timeout = parseInt(process.env.GROQ_TIMEOUT || '8000');
                        completionPromise = client.chat.completions.create({
                            model: model,
                            messages: messages,
                            temperature: options.temperature || 0.7,
                            max_tokens: options.max_tokens || parseInt(process.env.GROQ_MAX_TOKENS || '400'),
                            top_p: options.top_p || 1,
                            stream: false
                        });
                        timeoutPromise = new Promise(function (_, reject) {
                            return setTimeout(function () { return reject(new Error('Groq timeout')); }, timeout);
                        });
                        return [4 /*yield*/, Promise.race([completionPromise, timeoutPromise])];
                    case 1:
                        completion = _c.sent();
                        content = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                        if (!content) {
                            throw new Error('Groq no devolvió contenido');
                        }
                        return [2 /*return*/, {
                                content: content,
                                provider: 'groq',
                                model: model,
                                success: true
                            }];
                }
            });
        });
    };
    // 🏠 LM Studio (Local - Sin límites)
    AIMultiProvider.tryLMStudio = function (messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var url, timeout, controller, timeoutId, requestBody, configuredModel, response, errorText, data, content, usedModel, error_3;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        url = process.env.LM_STUDIO_URL || 'http://localhost:1234/v1/chat/completions';
                        timeout = parseInt(process.env.LM_STUDIO_TIMEOUT || '30000');
                        console.log("[LM Studio] Conectando a: ".concat(url));
                        controller = new AbortController();
                        timeoutId = setTimeout(function () { return controller.abort(); }, timeout);
                        requestBody = {
                            messages: messages,
                            temperature: options.temperature || 0.7,
                            max_tokens: options.max_tokens || 400,
                            stream: false
                        };
                        configuredModel = process.env.LM_STUDIO_MODEL;
                        if (configuredModel && configuredModel !== 'phi-2') {
                            requestBody.model = configuredModel;
                        }
                        console.log("[LM Studio] Request:", JSON.stringify(requestBody, null, 2));
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(requestBody),
                                signal: controller.signal
                            })];
                    case 2:
                        response = _d.sent();
                        clearTimeout(timeoutId);
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorText = _d.sent();
                        console.error("[LM Studio] Error response:", errorText);
                        throw new Error("LM Studio HTTP ".concat(response.status, ": ").concat(response.statusText));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _d.sent();
                        console.log("[LM Studio] Response:", JSON.stringify(data, null, 2));
                        content = (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
                        if (!content) {
                            throw new Error('LM Studio no devolvió contenido');
                        }
                        usedModel = data.model || configuredModel || 'lmstudio-local';
                        return [2 /*return*/, {
                                content: content,
                                provider: 'lmstudio',
                                model: usedModel,
                                success: true
                            }];
                    case 6:
                        error_3 = _d.sent();
                        clearTimeout(timeoutId);
                        if (error_3.name === 'AbortError') {
                            throw new Error('LM Studio timeout');
                        }
                        throw error_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // 🌐 OpenAI (Respaldo Premium)
    AIMultiProvider.tryOpenAI = function (messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var apiKey, model, response, error, data, content;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        apiKey = process.env.OPENAI_API_KEY;
                        if (!apiKey) {
                            throw new Error('OpenAI no configurado (falta OPENAI_API_KEY)');
                        }
                        model = options.model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
                        return [4 /*yield*/, fetch('https://api.openai.com/v1/chat/completions', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(apiKey)
                                },
                                body: JSON.stringify({
                                    model: model,
                                    messages: messages,
                                    temperature: options.temperature || 0.7,
                                    max_tokens: options.max_tokens || 400
                                })
                            })];
                    case 1:
                        response = _e.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        error = _e.sent();
                        throw new Error("OpenAI error: ".concat(((_a = error.error) === null || _a === void 0 ? void 0 : _a.message) || response.statusText));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _e.sent();
                        content = (_d = (_c = (_b = data.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content;
                        if (!content) {
                            throw new Error('OpenAI no devolvió contenido');
                        }
                        return [2 /*return*/, {
                                content: content,
                                provider: 'openai',
                                model: model,
                                success: true
                            }];
                }
            });
        });
    };
    // 🦙 Ollama (IA Local en tu VPS)
    AIMultiProvider.tryOllama = function (messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var ollamaUrl, model, timeout, controller, timeoutId, response, error, data, content, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';
                        model = options.model || process.env.OLLAMA_MODEL || 'llama3.2';
                        if (!process.env.OLLAMA_URL && !process.env.OLLAMA_MODEL) {
                            throw new Error('Ollama no configurado (falta OLLAMA_URL o OLLAMA_MODEL)');
                        }
                        timeout = parseInt(process.env.OLLAMA_TIMEOUT || '30000');
                        controller = new AbortController();
                        timeoutId = setTimeout(function () { return controller.abort(); }, timeout);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch("".concat(ollamaUrl, "/api/chat"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    model: model,
                                    messages: messages,
                                    stream: false,
                                    options: {
                                        temperature: options.temperature || 0.7,
                                        num_predict: options.max_tokens || 400
                                    }
                                }),
                                signal: controller.signal
                            })];
                    case 2:
                        response = _b.sent();
                        clearTimeout(timeoutId);
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        error = _b.sent();
                        throw new Error("Ollama error: ".concat(error || response.statusText));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _b.sent();
                        content = (_a = data.message) === null || _a === void 0 ? void 0 : _a.content;
                        if (!content) {
                            throw new Error('Ollama no devolvió contenido');
                        }
                        return [2 /*return*/, {
                                content: content,
                                provider: 'ollama',
                                model: model,
                                success: true
                            }];
                    case 6:
                        error_4 = _b.sent();
                        clearTimeout(timeoutId);
                        if (error_4.name === 'AbortError') {
                            throw new Error('Ollama timeout');
                        }
                        throw error_4;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // 🧪 Probar conectividad de todos los providers
    AIMultiProvider.testAllProviders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, testMessage, error_5, error_6, error_7, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = {};
                        testMessage = [
                            { role: 'system', content: 'Eres un asistente útil.' },
                            { role: 'user', content: 'Di "OK" si me entiendes.' }
                        ];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.tryGroq(testMessage, { max_tokens: 10 })];
                    case 2:
                        _a.sent();
                        results.groq = true;
                        console.log('[Test] ✅ Groq funcionando');
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        results.groq = false;
                        console.log('[Test] ❌ Groq falló:', error_5.message);
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.tryLMStudio(testMessage, { max_tokens: 10 })];
                    case 5:
                        _a.sent();
                        results.lmstudio = true;
                        console.log('[Test] ✅ LM Studio funcionando');
                        return [3 /*break*/, 7];
                    case 6:
                        error_6 = _a.sent();
                        results.lmstudio = false;
                        console.log('[Test] ❌ LM Studio falló:', error_6.message);
                        return [3 /*break*/, 7];
                    case 7:
                        if (!process.env.OPENAI_API_KEY) return [3 /*break*/, 11];
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.tryOpenAI(testMessage, { max_tokens: 10 })];
                    case 9:
                        _a.sent();
                        results.openai = true;
                        console.log('[Test] ✅ OpenAI funcionando');
                        return [3 /*break*/, 11];
                    case 10:
                        error_7 = _a.sent();
                        results.openai = false;
                        console.log('[Test] ❌ OpenAI falló:', error_7.message);
                        return [3 /*break*/, 11];
                    case 11:
                        if (!(process.env.OLLAMA_URL || process.env.OLLAMA_MODEL)) return [3 /*break*/, 15];
                        _a.label = 12;
                    case 12:
                        _a.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, this.tryOllama(testMessage, { max_tokens: 10 })];
                    case 13:
                        _a.sent();
                        results.ollama = true;
                        console.log('[Test] ✅ Ollama funcionando');
                        return [3 /*break*/, 15];
                    case 14:
                        error_8 = _a.sent();
                        results.ollama = false;
                        console.log('[Test] ❌ Ollama falló:', error_8.message);
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/, results];
                }
            });
        });
    };
    AIMultiProvider.groqClient = null;
    return AIMultiProvider;
}());
exports.AIMultiProvider = AIMultiProvider;
