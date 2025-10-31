"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// server.ts - Next.js Standalone + Socket.IO
var socket_1 = require("@/lib/socket");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var next_1 = __importDefault(require("next"));
var dev = process.env.NODE_ENV !== 'production';
var currentPort = 3000;
// En producción, escuchar en todas las interfaces (0.0.0.0) para Docker/Easypanel
var hostname = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
// Custom server with Socket.IO integration
function createCustomServer() {
    return __awaiter(this, void 0, void 0, function () {
        var nextApp, handle_1, server, io, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    nextApp = (0, next_1.default)({
                        dev: dev,
                        dir: process.cwd(),
                        // In production, use the current directory where .next is located
                        conf: dev ? undefined : { distDir: './.next' }
                    });
                    return [4 /*yield*/, nextApp.prepare()];
                case 1:
                    _a.sent();
                    handle_1 = nextApp.getRequestHandler();
                    server = (0, http_1.createServer)(function (req, res) {
                        var _a;
                        // Skip socket.io requests from Next.js handler
                        if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/api/socketio')) {
                            return;
                        }
                        handle_1(req, res);
                    });
                    io = new socket_io_1.Server(server, {
                        path: '/api/socketio',
                        cors: {
                            origin: "*",
                            methods: ["GET", "POST"]
                        }
                    });
                    (0, socket_1.setupSocket)(io);
                    // Start the server
                    server.listen(currentPort, hostname, function () { return __awaiter(_this, void 0, void 0, function () {
                        var SessionManager, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("> Ready on http://".concat(hostname, ":").concat(currentPort));
                                    console.log("> Socket.IO server running at ws://".concat(hostname, ":").concat(currentPort, "/api/socketio"));
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, , 5]);
                                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./src/lib/session-manager')); })];
                                case 2:
                                    SessionManager = (_a.sent()).SessionManager;
                                    return [4 /*yield*/, SessionManager.initialize()];
                                case 3:
                                    _a.sent();
                                    console.log('> WhatsApp Session Manager initialized');
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    console.error('> Error initializing Session Manager:', error_1);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.error('Server startup error:', err_1);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Start the server
createCustomServer();
