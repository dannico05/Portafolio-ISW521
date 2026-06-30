/*function Curso(nombre){
    this.nombre = nombre;
}

const prog = Curso("Programacion web");
console.log(prog.nombre);

//Falta el new antes de curso , si no seria una función normal
*/

//Un saldo que no acepta numeros negativos 

class CuentaBancaria {
    constructor(saldoInicial){
        this._saldo = saldoInicial
    }

    get saldo(){
        return this._saldo;
    }

    set saldo(valor){
        if (valor < 0) throw new Error("Saldo no puede ser negativo");
        this._saldo = valor;
    }

}

const cuenta = new CuentaBancaria(1000);
cuenta.saldo = 1500;
console.log(cuenta.saldo); //1500