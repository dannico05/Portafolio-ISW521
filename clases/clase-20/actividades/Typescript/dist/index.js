"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Persona = void 0;
console.log("Hola Byron!");
console.log("Hola Bolanos!");
// explicita
let nombre = "Byron";
// implicita
let apellido = "Bolanos";
// funciones
// explicita
function suma(a, b) {
    return a + b;
}
// implicita
function sumaDos(a, b) {
    return a + b;
}
function saludar(nombre) {
    console.log(`Hola, ${nombre}!`);
}
// POO
class Persona {
    nombre;
    apellido;
    edad;
    constructor(nombre, apellido, edad) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
    }
    saludar() {
        console.log(`Hola, mi nombre es ${this.nombre} ${this.apellido} y tengo ${this.edad} años.`);
    }
}
exports.Persona = Persona;
const index_js_1 = require("./index.js");
const persona1 = new index_js_1.Persona("Byron", "Bolanos Zamora", 23);
console.log(persona1.saludar());
//# sourceMappingURL=index.js.map