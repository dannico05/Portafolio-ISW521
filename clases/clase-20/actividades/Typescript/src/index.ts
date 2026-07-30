console.log("Hola Byron!");
console.log("Hola Bolanos!");

// explicita
let nombre: string = "Byron";

// implicita
let apellido = "Bolanos";

// funciones
// explicita
function suma(a:number, b:number): number {
    return a + b;
}
// implicita
function sumaDos(a:number, b:number) {
    return a + b;
}

function saludar(nombre: string): void {
    console.log(`Hola, ${nombre}!`);
}

// POO
export class Persona {
    nombre: string;
    apellido: string;
    edad: number;

    constructor(nombre: string, apellido: string, edad: number) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
    }

    saludar(): void {
        console.log(`Hola, mi nombre es ${this.nombre} ${this.apellido} y tengo ${this.edad} años.`);
    }
}
import { Persona } from "./index.js";
const persona1 = new Persona("Byron", "Bolanos Zamora", 23);
console.log(persona1.saludar());
