/*const numeros = [40, 34, 5, 8,100, 6];

console.log(numeros.sort((a, b) => a - b));
// (a, b) = funcion
// => = arow funtion 
// a - b = ordena de menor a mayor

let arr = ["a", "b", "c"];
arr[7] = "z";
arr.length; // 8

// y en arr[2] es c
// y en el for imprimiria indefinido porque hay huecos 

// imperativo 
const dobleImp = [];
for (let i = 0; i < numeros.length; i++) {
  dobleImp.push(numeros[i] * 2);
}

// declarativo
const dobleDec = numeros.map(n => n * 2);

// imperativo
const precios = [100, 250, 80, 400];
const caros = [];
for (let i= 0; i < precios.length; i++) {
    if (precios[i] > 150) {
        caros.push(precios[i]);
    }
}
console.log(caros);

// declarativo
const carosDec = precios.filter(p => p > 150);
console.log(carosDec);
// el filter devuelve un nuevo array con los elementos que cumplen la condicion, en este caso mayores a 150

const estudiantes = [
    { nombre: "Ana", carnet: "2024001" },
    { nombre: "Luis", carnet: "2024002" },
    ];

// formateado con map 
const nombres = estudiantes.map(estudiante => `${estudiante.nombre.toUpperCase()}(${estudiante.carnet})`);
console.log(nombres); 

const estudiantes = [
    { nombre: "Ana", promedio : 85 },
    { nombre: "Luis", promedio: 67 },
    { nombre: "Sara", promedio: 91 },
    ];

// filtrar por promedio mayor a 80
const estudiantesAprobados = estudiantes.filter(estudiante => estudiante.promedio >= 80);
const nombresAprobados = estudiantesAprobados.map(estudiante => estudiante.nombre);
console.log(nombresAprobados);
*/
