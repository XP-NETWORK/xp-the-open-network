"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
exports.BridgeContract = void 0;
var ed = require("@noble/ed25519");
var bn_js_1 = require("bn.js");
var tonweb_1 = require("tonweb");
var Contract = tonweb_1["default"].Contract;
var Cell = tonweb_1["default"].boc.Cell;
var BridgeContract = /** @class */ (function (_super) {
    __extends(BridgeContract, _super);
    function BridgeContract(provider, options) {
        var _this = _super.call(this, provider, options) || this;
        _this.getPublicKey = function () { return __awaiter(_this, void 0, void 0, function () {
            var address, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAddress()];
                    case 1:
                        address = _a.sent();
                        return [4 /*yield*/, this.provider.call2(address.toString(), 'get_public_key')];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        _this.isInitialized = function () { return __awaiter(_this, void 0, void 0, function () {
            var address, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAddress()];
                    case 1:
                        address = _a.sent();
                        return [4 /*yield*/, this.provider.call2(address.toString(), 'is_initialized')];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        _this.getActionId = function () { return __awaiter(_this, void 0, void 0, function () {
            var address, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAddress()];
                    case 1:
                        address = _a.sent();
                        return [4 /*yield*/, this.provider.call2(address.toString(), 'get_action_id')];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        _this.getWhitelist = function () { return __awaiter(_this, void 0, void 0, function () {
            var address, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAddress()];
                    case 1:
                        address = _a.sent();
                        return [4 /*yield*/, this.provider.call2(address.toString(), 'get_whitelist')];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        _this.isPaused = function () { return __awaiter(_this, void 0, void 0, function () {
            var address, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAddress()];
                    case 1:
                        address = _a.sent();
                        return [4 /*yield*/, this.provider.call2(address.toString(), 'is_paused')];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        }); };
        _this.methods.getPublicKey = _this.getPublicKey;
        _this.methods.isInitialized = _this.isInitialized;
        _this.methods.getActionId = _this.getActionId;
        _this.methods.getWhitelist = _this.getWhitelist;
        return _this;
    }
    BridgeContract.prototype.serializeUri = function (uri) {
        return new TextEncoder().encode(encodeURI(uri));
    };
    BridgeContract.prototype.createSetupBody = function () {
        return __awaiter(this, void 0, void 0, function () {
            var publicKey, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ed.getPublicKey(this.options.ed25519PrivateKey)];
                    case 1:
                        publicKey = _a.sent();
                        body = new tonweb_1["default"].boc.Cell();
                        body.bits.writeUint(0, 32);
                        body.bits.writeUint(new bn_js_1["default"](publicKey), 256);
                        return [2 /*return*/, body];
                }
            });
        });
    };
    BridgeContract.prototype.createMintBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, msg, _a, _b, nftItemContent, uriContent, msgHashArray, sigArray, publicKey, isValid, signature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = new Cell();
                        body.bits.writeUint(1, 32); // OP validate_transfer_nft
                        msg = new Cell();
                        msg.bits.writeUint(1, 8); // OP validate_transfer_nft
                        msg.bits.writeUint(params.actionId, 32);
                        msg.bits.writeUint(params.itemIndex, 64);
                        msg.bits.writeCoins(params.amountToCollection);
                        msg.bits.writeCoins(params.amountToItem);
                        _b = (_a = msg.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        msg.bits.writeAddress(params.mintWith);
                        nftItemContent = new Cell();
                        nftItemContent.bits.writeAddress(params.to);
                        uriContent = new Cell();
                        uriContent.bits.writeBytes(this.serializeUri(params.contentUri));
                        nftItemContent.refs[0] = uriContent;
                        msg.refs[0] = nftItemContent;
                        return [4 /*yield*/, msg.hash()];
                    case 2:
                        msgHashArray = _c.sent();
                        return [4 /*yield*/, ed.sign(msgHashArray, this.options.ed25519PrivateKey)];
                    case 3:
                        sigArray = _c.sent();
                        return [4 /*yield*/, ed.getPublicKey(this.options.ed25519PrivateKey)];
                    case 4:
                        publicKey = _c.sent();
                        return [4 /*yield*/, ed.verify(sigArray, msgHashArray, publicKey)];
                    case 5:
                        isValid = _c.sent();
                        if (!isValid) {
                            throw new Error("invalid signature");
                        }
                        signature = new tonweb_1["default"].boc.Cell();
                        signature.bits.writeBytes(sigArray);
                        body.refs[0] = msg;
                        body.refs[1] = signature;
                        return [2 /*return*/, body];
                }
            });
        });
    };
    BridgeContract.prototype.createWithdrawBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var cell, _a, _b, msg;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        cell = new Cell();
                        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
                        cell.bits.writeUint(0, 64);
                        cell.bits.writeAddress(new tonweb_1["default"].Address(process.env.BURNER_ADDRESS)); // target address
                        _b = (_a = cell.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]); // bridge as response address
                        cell.bits.writeBit(false); // null custom_payload
                        cell.bits.writeCoins(new bn_js_1["default"](0)); // forward amount
                        cell.bits.writeBit(true); // forward_payload in this slice, not separate cell
                        msg = new Cell();
                        msg.bits.writeUint(params.chainNonce, 8);
                        msg.bits.writeBytes(params.to);
                        cell.refs[0] = msg;
                        return [2 /*return*/, cell];
                }
            });
        });
    };
    BridgeContract.prototype.createUnfreezeBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, msg, _a, _b, msgHash, sigArray, publicKey, isValid, signature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = new Cell();
                        body.bits.writeUint(2, 32); // OP validate_unfreeze_nft
                        msg = new Cell();
                        msg.bits.writeUint(2, 8); // OP validate_unfreeze_nft
                        msg.bits.writeUint(params.actionId, 32);
                        msg.bits.writeCoins(params.amount);
                        _b = (_a = msg.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        msg.bits.writeAddress(params.itemAddress);
                        msg.bits.writeAddress(params.to);
                        return [4 /*yield*/, msg.hash()];
                    case 2:
                        msgHash = _c.sent();
                        return [4 /*yield*/, ed.sign(msgHash, this.options.ed25519PrivateKey)];
                    case 3:
                        sigArray = _c.sent();
                        return [4 /*yield*/, ed.getPublicKey(this.options.ed25519PrivateKey)];
                    case 4:
                        publicKey = _c.sent();
                        return [4 /*yield*/, ed.verify(sigArray, msgHash, publicKey)];
                    case 5:
                        isValid = _c.sent();
                        if (!isValid) {
                            throw new Error("invalid signature");
                        }
                        signature = new tonweb_1["default"].boc.Cell();
                        signature.bits.writeBytes(sigArray);
                        body.refs[0] = msg;
                        body.refs[1] = signature;
                        return [2 /*return*/, body];
                }
            });
        });
    };
    BridgeContract.prototype.createFreezeBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var cell, _a, _b, payload;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        cell = new Cell();
                        cell.bits.writeUint(0x5fcc3d14, 32); // transfer op
                        cell.bits.writeUint(0, 64);
                        _b = (_a = cell.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]); // target address
                        cell.bits.writeAddress(undefined); // undefined as response address
                        cell.bits.writeBit(false); // null custom_payload
                        cell.bits.writeCoins(params.amount || new bn_js_1["default"](0));
                        cell.bits.writeBit(false); // forward_payload in this slice, not separate cell
                        payload = new Cell();
                        payload.bits.writeUint(params.chainNonce, 8);
                        payload.bits.writeUint(params.to.length, 16);
                        payload.bits.writeBytes(params.to);
                        payload.bits.writeBytes(params.mintWith);
                        cell.refs[0] = payload;
                        return [2 /*return*/, cell];
                }
            });
        });
    };
    BridgeContract.prototype.createUpdateBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, msg, _a, _b, msgHashArray, sigArray, publicKey, isValid, signature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = new Cell();
                        body.bits.writeUint(6, 32); // OP
                        msg = new Cell();
                        msg.bits.writeUint(6, 8); // OP
                        msg.bits.writeUint(params.actionId, 32);
                        _b = (_a = msg.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        msg.bits.writeUint(new bn_js_1["default"](params.newGroupKey), 256);
                        return [4 /*yield*/, msg.hash()];
                    case 2:
                        msgHashArray = _c.sent();
                        return [4 /*yield*/, ed.sign(msgHashArray, this.options.ed25519PrivateKey)];
                    case 3:
                        sigArray = _c.sent();
                        return [4 /*yield*/, ed.getPublicKey(this.options.ed25519PrivateKey)];
                    case 4:
                        publicKey = _c.sent();
                        return [4 /*yield*/, ed.verify(sigArray, msgHashArray, publicKey)];
                    case 5:
                        isValid = _c.sent();
                        if (!isValid) {
                            throw new Error("invalid signature");
                        }
                        signature = new tonweb_1["default"].boc.Cell();
                        signature.bits.writeBytes(sigArray);
                        body.refs[0] = msg;
                        body.refs[1] = signature;
                        return [2 /*return*/, body];
                }
            });
        });
    };
    BridgeContract.prototype.createWithdrawFeeBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, msg, _a, _b, msgHashArray, sigArray, publicKey, isValid, signature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = new Cell();
                        body.bits.writeUint(5, 32);
                        msg = new Cell();
                        msg.bits.writeUint(5, 8); // OP
                        msg.bits.writeUint(params.actionId, 32);
                        _b = (_a = msg.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, msg.hash()];
                    case 2:
                        msgHashArray = _c.sent();
                        return [4 /*yield*/, ed.sign(msgHashArray, this.options.ed25519PrivateKey)];
                    case 3:
                        sigArray = _c.sent();
                        return [4 /*yield*/, ed.getPublicKey(this.options.ed25519PrivateKey)];
                    case 4:
                        publicKey = _c.sent();
                        return [4 /*yield*/, ed.verify(sigArray, msgHashArray, publicKey)];
                    case 5:
                        isValid = _c.sent();
                        if (!isValid) {
                            throw new Error("invalid signature");
                        }
                        signature = new tonweb_1["default"].boc.Cell();
                        signature.bits.writeBytes(sigArray);
                        body.refs[0] = msg;
                        body.refs[1] = signature;
                        return [2 /*return*/, body];
                }
            });
        });
    };
    BridgeContract.prototype.createPauseBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, msg, _a, _b, msgHashArray, sigArray, publicKey, isValid, signature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = new Cell();
                        body.bits.writeUint(8, 32);
                        msg = new Cell();
                        msg.bits.writeUint(8, 8); // OP
                        msg.bits.writeUint(params.actionId, 32);
                        _b = (_a = msg.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, msg.hash()];
                    case 2:
                        msgHashArray = _c.sent();
                        return [4 /*yield*/, ed.sign(msgHashArray, this.options.ed25519PrivateKey)];
                    case 3:
                        sigArray = _c.sent();
                        return [4 /*yield*/, ed.getPublicKey(this.options.ed25519PrivateKey)];
                    case 4:
                        publicKey = _c.sent();
                        return [4 /*yield*/, ed.verify(sigArray, msgHashArray, publicKey)];
                    case 5:
                        isValid = _c.sent();
                        if (!isValid) {
                            throw new Error("invalid signature");
                        }
                        signature = new tonweb_1["default"].boc.Cell();
                        signature.bits.writeBytes(sigArray);
                        body.refs[0] = msg;
                        body.refs[1] = signature;
                        return [2 /*return*/, body];
                }
            });
        });
    };
    BridgeContract.prototype.createUnpauseBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, msg, _a, _b, msgHashArray, sigArray, publicKey, isValid, signature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = new Cell();
                        body.bits.writeUint(9, 32);
                        msg = new Cell();
                        msg.bits.writeUint(9, 8); // OP
                        msg.bits.writeUint(params.actionId, 32);
                        _b = (_a = msg.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [4 /*yield*/, msg.hash()];
                    case 2:
                        msgHashArray = _c.sent();
                        return [4 /*yield*/, ed.sign(msgHashArray, this.options.ed25519PrivateKey)];
                    case 3:
                        sigArray = _c.sent();
                        return [4 /*yield*/, ed.getPublicKey(this.options.ed25519PrivateKey)];
                    case 4:
                        publicKey = _c.sent();
                        return [4 /*yield*/, ed.verify(sigArray, msgHashArray, publicKey)];
                    case 5:
                        isValid = _c.sent();
                        if (!isValid) {
                            throw new Error("invalid signature");
                        }
                        signature = new tonweb_1["default"].boc.Cell();
                        signature.bits.writeBytes(sigArray);
                        body.refs[0] = msg;
                        body.refs[1] = signature;
                        return [2 /*return*/, body];
                }
            });
        });
    };
    BridgeContract.prototype.createWhitelistBody = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var body, msg, _a, _b, msgHashArray, sigArray, publicKey, isValid, signature;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        body = new Cell();
                        body.bits.writeUint(7, 32);
                        msg = new Cell();
                        msg.bits.writeUint(7, 8); // OP
                        msg.bits.writeUint(params.actionId, 32);
                        _b = (_a = msg.bits).writeAddress;
                        return [4 /*yield*/, this.getAddress()];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        msg.bits.writeAddress(params.collection);
                        return [4 /*yield*/, msg.hash()];
                    case 2:
                        msgHashArray = _c.sent();
                        return [4 /*yield*/, ed.sign(msgHashArray, this.options.ed25519PrivateKey)];
                    case 3:
                        sigArray = _c.sent();
                        return [4 /*yield*/, ed.getPublicKey(this.options.ed25519PrivateKey)];
                    case 4:
                        publicKey = _c.sent();
                        return [4 /*yield*/, ed.verify(sigArray, msgHashArray, publicKey)];
                    case 5:
                        isValid = _c.sent();
                        if (!isValid) {
                            throw new Error("invalid signature");
                        }
                        signature = new tonweb_1["default"].boc.Cell();
                        signature.bits.writeBytes(sigArray);
                        body.refs[0] = msg;
                        body.refs[1] = signature;
                        return [2 /*return*/, body];
                }
            });
        });
    };
    return BridgeContract;
}(Contract));
exports.BridgeContract = BridgeContract;
