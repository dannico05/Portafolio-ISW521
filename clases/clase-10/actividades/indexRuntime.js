const v8 = require('v8');

const miVariable = {
    nombre: "Juan",
    version:2026
};

const  tamano = v8.serialize(miVariable).length;

console.log(`El tamaño de miVariable es: ${tamano} bytes`);


// crea una constante para importar el módulo v8, que es un motor de JavaScript utilizado por Node.js para ejecutar código JavaScript. 
// Este módulo proporciona funciones para interactuar con el motor V8, como la serialización de objetos y la obtención de estadísticas de memoria.
const readline = require('readline/promises'); // trae la version mas reciente 

// es un módulo de Node.js que proporciona una interfaz para leer datos de una secuencia de entrada (como la consola) 
// y escribir datos en una secuencia de salida (como la consola).
const { stdin: input, stdout: output } = require('process'); // esto es para traer la entrada y salida del proceso, de la consola

// crea un puente eentre el proccess para poder interactuar con el usuario a través de la consola, es decir, 
// para poder leer lo que el usuario escribe en la consola y escribir en la consola.
const rl = readline.createInterface({ input, output }); // esto es para crear una interfaz de lectura y escritura en la consola

// asincrona: permite que el programa no se bloquee mientras espera a que se complete una tarea, 
// como la lectura de datos del usuario, la consulta a una base de datos, etc. 
// En JavaScript, se pueden usar promesas, async/await, callbacks, etc. para manejar la asincronía.

// en javascript se trabaja con camelCase (nomenclatura) para nombrar las funciones, variables, etc
async function iniciar() {
    const nombre = await rl.question("Digite su nombre: "); // esto es para que el usuario de su nombre y esperar a que lo ingrese
    
    // valida si cumple o no segun la expresion regular que se encuentra en la función validarDatos
    if (validarDatos(nombre)) {
        console.log(`Hola, ${nombre}!`); // esto es para saludar al usuario con su nombre
    } else {
        console.log("Nombre inválido.");
    }

    rl.close(); // esto es para cerrar la interfaz de lectura y escritura en la consola
}

function validarDatos(nombre) {
    const expresion = /^[a-zA-Z]+$/; // esto es una expresión regular para validar que el nombre solo contenga letras y espacios
    const nombreValidado = expresion.test(nombre); // esto es para validar el nombre con la expresión regular
    if (nombreValidado) {
        return true; // esto es para retornar true si el nombre es válido
    }
    else {
        return false; // esto es para retornar false si el nombre no es válido
    }
}

iniciar(); // esto es para que la función inicie y se ejecute el programa

/**
 * Expresiones reglares: es para validar datos de entrada, como el nombre del usuario, el correo electrónico, etc.
 * el + es que al menos debe existir una letra o sea qiue no este en blanco, el ^ es para indicar el inicio de la cadena, el $ es para indicar el final de la cadena, 
 * y el [] es para indicar un rango de caracteres.
 * 
 * Scope: es el alcance de las variables, es decir, donde se pueden usar las variables. En JavaScript, existen tres tipos de scope: global, local y bloque.
 * 
 * 
 */