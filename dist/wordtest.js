"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const worddb_1 = require("./worddb");
const router = express_1.default.Router();
router.post('/word', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.body;
    if (typeof type !== 'number' || (type !== 1 && type !== 2)) {
        return res.status(400).send('Invalid type parameter');
    }
    try {
        const wordData = yield (0, worddb_1.getWord)(type);
        res.send(wordData);
    }
    catch (error) {
        res.status(500).send('Error retrieving word data');
    }
}));
exports.default = router;
