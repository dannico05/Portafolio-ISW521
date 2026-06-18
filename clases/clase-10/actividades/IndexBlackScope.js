consolo.log("Hola");

// var: se puede usar en cualquier parte del código, incluso antes de su declaración, debido a su comportamiento de "hoisting" (elevación).
if (true) {
    var edad = 25;
}

// esto es funcional 
console.log(edad); // 25


//let: solo se puede usar dentro del bloque donde se declaró, es decir, dentro de las llaves {}
if (true) {
    let puntos =100;
    console.log(puntos); // 100

}

// esto no es funcional 
console.log(puntos); // Error: puntos is not defined

// const: se utiliza para declarar variables que no pueden ser reasignadas después de su inicialización.
const PI = 3.1416;
PI = 3; // TypeError: Assignment to constant variable.

const user = { id: 1 };
user.id = 2; // Esto es funcional, ya que estamos modificando una propiedad del objeto, no reasignando la variable user.



