import { Animal } from "./Animal.js";

export class Perro extends Animal{
    constructor(nombre, especie, raza, edad){
        super(nombre, especie);
        this.raza = raza;
        this.edad = edad;
    }

    ladrar(){
        console.log(`el perro llamado ${this.nombre} esta ladrando`);
    }

    comer(){
        console.log(`el perro llamado ${this.nombre} esta commiendo`);
    }
}