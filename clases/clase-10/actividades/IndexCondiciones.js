const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');

const rl = readline.createInterface({ input, output });

// condiciones: 1 a 12 son nińos, 13 a 17 adolescentes, 18 o más adultos 

async function iniciar() {
    const edadInput = await rl.question("Digite su edad: ");
    const edad = parseInt(edadInput); // esto es para convertir la edad a un número entero, ya que el input devuelve un string

    // Condición con if/else
    if (edad >= 1 && edad <= 12) {
        console.log("Eres un Niño");
    }
    else if (edad >= 13 && edad <= 17) {
        console.log("Eres un Adolescente");
    }
    else if (edad >= 18) {
        console.log("Eres un Adulto");
    }
    else {
        console.log("Edad no válida");
    }

    // Condición con operador ternario
    const resultado = (edad >= 1 && edad <= 12) ? "Eres un Niño" :
                    (edad >= 13 && edad <= 17) ? "Eres un Adolescente" :
                     (edad >= 18) ? "Eres un Adulto" : "Edad no válida";
    console.log("Resultado con el ternario: " + resultado);

    // los : se utilizan para separar las diferentes condiciones en el operador ternario
    // el ? se utiliza para indicar la condición a evaluar en el operador ternario, o sea 
    //  si la condición es verdadera, se ejecuta la primera parte (después del ?)
    // y si es falsa, se evalúa la siguiente condición (después del siguiente ?), y así hasta das la condicion verdadera .

    rl.close();
}

iniciar();





