# Clase #11 - Resumen Completo: Funciones, Scope, Closures, ES6+ y Módulos

---

# TEMA 1: Arquitectura de Funciones en JavaScript

## 1.1 Funciones de Primera Clase y Orden Superior

### Concepto clave
En JavaScript, las funciones son valores como cualquier otro (números, strings, etc.).

```javascript
// Puedes guardar una función en una variable
const saludar = function(nombre) {
    return `Hola, ${nombre}`;
};

// Puedes pasar una función como argumento
function procesar(fn, nombre) {
    return fn(nombre).toUpperCase();
}

procesar(saludar, "Ana"); // "HOLA, ANA"
```

### Función de orden superior
Una función que recibe otra función como parámetro o devuelve una función.

### Dónde se usa

- Express.js (middlewares)
- Array methods: `.map()`, `.filter()`, `.reduce()`
- Patrones como Redux (reducers)

---

## 1.2 Function Declaration vs Function Expression

| Function Declaration | Function Expression |
|---------------------|--------------------|
| `function suma(a, b) {}` | `const suma = function(a, b) {};` |
| Hoisting completo | TDZ (Temporal Dead Zone) |
| Se puede llamar antes de declararla | No se puede llamar antes de la línea donde se define |
| El motor guarda nombre y cuerpo en compilación | Solo existe después de la asignación |

```javascript
// Funciona - Hoisting completo
declarada();

function declarada() {
    console.log("OK");
}

// ReferenceError - TDZ
expresada();

const expresada = function() {
    console.log("Error");
};

// TypeError - Arrow function no tiene [[Construct]]
new flecha();

const flecha = () => {};
```

### Convención profesional

- Airbnb y Google Style Guide recomiendan `const` para funciones.
- Mejor para tree-shaking (Vite lo aprovecha).
- React usa function expressions / arrow functions.

---

## 1.3 Arrow Functions

### Sintaxis

```javascript
// Tradicional
function sumar(a, b) {
    return a + b;
}

// Arrow function
const sumar = (a, b) => a + b;

// Con un solo parámetro
const doble = x => x * 2;

// Sin parámetros
const saludar = () => "Hola";
```

### No es solo azúcar sintáctico

| Característica | Arrow Function | Function Tradicional |
|---------------|---------------|----------------------|
| this | Hereda del contexto léxico | Depende de cómo se invoca |
| arguments | No tiene | Sí tiene |
| Como constructor (`new`) | TypeError | Sí funciona |

### Ventajas

- Sintaxis corta, ideal para callbacks.
- Retorno implícito.
- Resuelve el problema de `this` en callbacks.

### Riesgos

- No sirve para métodos de objeto que necesiten su propio `this`.
- No puede ser constructor.
- Puede esconder de qué `this` depende el código.

---

# TEMA 2: Ámbito, Closures y Contexto (`this`)

## 2.1 Ámbito Léxico (Lexical Scope)

### Definición

Las variables que una función puede ver dependen de dónde fue escrita la función, no de dónde fue llamada.

```javascript
function exterior() {
    const mensaje = "hola desde afuera";

    function interior() {
        console.log(mensaje);
    }

    interior();
}

exterior(); // "hola desde afuera"
```

### Cómo busca el motor

1. Busca en el ámbito actual.
2. Sube por la cadena de ámbitos externos.
3. Llega al ámbito global (si no existe → `ReferenceError`).

> Importante: El ámbito léxico se decide al escribir el código, no al ejecutarlo.

---

## 2.2 Closures (Clausuras)

### Definición

Una función que conserva acceso a las variables de su ámbito léxico original, incluso después de que la función externa ya terminó de ejecutarse.

```javascript
function crearContador() {
    let cuenta = 0;

    return function() {
        cuenta++;
        return cuenta;
    };
}

const contador = crearContador();

console.log(contador()); // 1
console.log(contador()); // 2
```

### ¿Por qué la variable sigue viva?

- La función interna guarda una referencia al entorno.
- El Garbage Collector NO recoge el entorno mientras exista referencia.

### Usos comunes

- Module Pattern (antes de ES Modules)
- React `useState`
- Debounce y Throttle

### Riesgos

Pueden causar fugas de memoria si se usan descuidadamente.

---

## 2.3 El comportamiento dinámico de `this`

### Regla de oro

El ámbito léxico se decide al escribir; `this` se decide al invocar.

```javascript
function presentar() {
    console.log(this.nombre);
}

const persona1 = { nombre: "Ana", presentar };
const persona2 = { nombre: "Luis", presentar };

persona1.presentar(); // Ana
persona2.presentar(); // Luis
presentar();          // undefined
```

### Reglas de `this`

| Forma de invocar | this apunta a... |
|-----------------|------------------|
| `miFuncion()` | `undefined` (strict mode) |
| `objeto.metodo()` | El objeto antes del punto |
| `new Constructor()` | La nueva instancia |
| `setTimeout(fn, 1000)` | `undefined` |

### Problema: pérdida de contexto

```javascript
const cronometro = {
    segundos: 0,

    iniciar: function() {
        setTimeout(function() {
            this.segundos++;
        }, 1000);
    }
};
```

### Soluciones

#### Arrow Function

```javascript
iniciar: function() {
    setTimeout(() => {
        this.segundos++;
    }, 1000);
}
```

#### `.bind(this)`

```javascript
iniciar: function() {
    setTimeout(function() {
        this.segundos++;
    }.bind(this), 1000);
}
```

---

## 2.4 Control manual: `call`, `apply` y `bind`

| Método | Ejecución | Argumentos |
|----------|----------|------------|
| `.call(contexto, arg1, arg2)` | Inmediata | Uno por uno |
| `.apply(contexto, [arg1, arg2])` | Inmediata | En arreglo |
| `.bind(contexto)` | Diferida | Devuelve nueva función |

```javascript
function presentar(saludo) {
    console.log(`${saludo}, soy ${this.nombre}`);
}

const persona = { nombre: "Carla" };

presentar.call(persona, "Hola");
presentar.apply(persona, ["Buenas"]);

const presentarCarla = presentar.bind(persona);
presentarCarla("Qué tal");
```

### Usos comunes

- React clases legacy: `.bind(this)`
- Préstamo de métodos:
  ```javascript
  Array.prototype.slice.call(arguments)
  ```

---

## TRAMPAS en un solo fragmento

```javascript
declarada();     // OK - hoisting completo
expresada();     // ReferenceError - TDZ
new flecha();    // TypeError - arrow no tiene [[Construct]]
```

---

# PARTE 2: ES6+, MÓDULOS Y LABORATORIO

# TEMA 3: Expresividad y Manejo de Datos (ES6+)

## 3.1 Template Literals

```javascript
const nombre = "Ana";
const edad = 23;

// Viejo
const mensajeViejo = "Hola " + nombre + ", tenés " + edad + " años.";

// Nuevo
const mensajeNuevo = `Hola ${nombre}, tenés ${edad} años.`;
```

### Ventajas

- Interpolación clara.
- Saltos de línea reales.
- Permite expresiones completas dentro de `${}`.

---

## 3.2 Destructuring

### Con objetos

```javascript
const persona = {
    nombre: "Luis",
    edad: 30,
    rol: "dev"
};

const { nombre, rol } = persona;

const { nombre: nombreUsuario } = persona;

const { rol = "invitado" } = persona;
```

### Con arreglos

```javascript
const colores = ["rojo", "verde", "azul"];

const [primero, segundo] = colores;
const [, segundo] = colores;
const [primero, , tercero] = colores;
```

### Uso profesional

- React:
  ```javascript
  function Boton({ texto, color })
  ```
- APIs:
  ```javascript
  const { data, error } = await fetch(...)
  ```

---

## 3.3 Rest Parameter (`...`)

```javascript
function sumarTodo(primero, ...resto) {
    console.log(primero);
    console.log(resto);

    return resto.reduce(
        (total, n) => total + n,
        0
    );
}

sumarTodo(1, 2, 3, 4);
```

### Reglas

- Siempre va al final.
- Solo puede haber uno.
- Crea un arreglo real.

---

## 3.4 Spread Operator (`...`)

```javascript
const numeros = [1, 2, 3];

const copia = [...numeros, 4];

const maximo = Math.max(...numeros);

const original = {
    nombre: "Equipo A",
    puntos: 10
};

const actualizado = {
    ...original,
    puntos: 15
};
```

### Casos de uso

- React:
  ```javascript
  setEstado({
      ...estado,
      campo: nuevoValor
  })
  ```

- Fusionar configuraciones.
- Copiar arreglos u objetos sin mutar.

### Shallow Copy

Solo copia el primer nivel.

---

## 3.5 Refactor de función de configuración

### Código viejo

```javascript
function generarResumen(config) {
    const mensaje =
        "Resumen de " +
        config.nombre +
        " (" +
        config.tipo +
        ")";

    config.total = 0;

    return mensaje;
}
```

### Código refactorizado

```javascript
function generarResumen(
    { nombre, tipo },
    ...opciones
) {
    const total = opciones.length;

    return {
        mensaje: `Resumen de ${nombre} (${tipo})`,
        total
    };
}
```

---

# TEMA 4: Navegación Segura (ES2020+)

## 4.1 Optional Chaining (`?.`)

```javascript
const respuesta = {
    data: {
        usuario: null
    }
};

const nombre = respuesta?.data?.usuario?.nombre;

console.log(nombre); // undefined
```

### Comportamiento

Se detiene en el primer `null` o `undefined`.

---

## 4.2 Nullish Coalescing (`??`)

```javascript
const descuento = 0;
const nombre = "";

console.log(descuento || 10);
console.log(nombre || "Invitado");

console.log(descuento ?? 10);
console.log(nombre ?? "Invitado");
```

### ¿Cuándo usar cada uno?

| Operador | Uso |
|-----------|------|
| `||` | Fallback para cualquier valor falsy |
| `??` | Mantiene `0`, `""` y `false` como válidos |

---

# TEMA 5: Arquitectura Modular (ES Modules)

## 5.1 El problema del ámbito global

```html
<!-- archivo1.js -->
<script>
var total = 100;
</script>

<!-- archivo2.js -->
<script>
var total = 0;
</script>
```

### Problemas

- Todos los scripts comparten ámbito global.
- Colisiones de nombres.
- El orden de carga importa.

---

## 5.2 Sintaxis de módulos

### Export nombrado

```javascript
// matematicas.js

export function suma(a, b) {
    return a + b;
}

export function resta(a, b) {
    return a - b;
}
```

```javascript
// main.js

import {
    suma,
    resta as diferencia
} from "./matematicas.js";
```

### Export default

```javascript
// ProductoCard.js

export default function ProductoCard({
    nombre,
    precio
}) {
    return `<div>${nombre} - $${precio}</div>`;
}
```

```javascript
// main.js

import ProductoCard
from "./ProductoCard.js";
```

### Cuándo usar cada uno

| Tipo | Uso |
|--------|------|
| Named Export | Librerías de utilidades |
| Default Export | Componentes UI |

---

## 5.3 El atributo `type="module"`

```html
<script
    type="module"
    src="./main.js">
</script>
```

### Qué cambia

- Ámbito aislado.
- Habilita `import/export`.
- Aplica CORS.
- Modo estricto automático.

---

# TEMA 6: Laboratorio con Vite

## ¿Qué es Vite?

Herramienta de desarrollo y empaquetado que:

### En desarrollo

Sirve módulos ES nativos.

### En producción

Genera un build optimizado.

### Ventajas sobre Webpack

- Arranque instantáneo.
- Recarga en caliente rápida.
- Usa esbuild (Go).

---

## El reto: Refactorizar código spaghetti

### Código original

```javascript
var nombreUsuario = "invitado";
var listaProductos = [];

function agregarProducto(nombre, precio) {
    listaProductos.push({
        nombre: nombre,
        precio: precio
    });

    console.log(
        "Agregado: " +
        nombre +
        " - $" +
        precio
    );
}

function calcularTotal() {
    var total = 0;

    for (
        var i = 0;
        i < listaProductos.length;
        i++
    ) {
        total =
            total +
            listaProductos[i].precio;
    }

    return total;
}
```

### Refactor esperado

```javascript
// productos.js

export const agregarProducto = (
    lista,
    { nombre, precio }
) => {
    lista.push({ nombre, precio });

    console.log(
        `Agregado: ${nombre} - $${precio}`
    );
};

export const calcularTotal = lista =>
    lista.reduce(
        (total, p) =>
            total + (p?.precio ?? 0),
        0
    );
```

```javascript
// main.js

import {
    agregarProducto,
    calcularTotal
} from "./productos.js";
```

---

## Checklist de entrega

- Corre con `npm run dev`
- Al menos 3 archivos con `import/export`
- No queda ningún `var`
- Al menos una función usa destructuring
- Al menos un acceso usa `?.` o `??`
- Todos los mensajes usan template literals

---

# RESUMEN DE REGLAS CLAVE

| Concepto | Regla |
|-----------|--------|
| Hoisting | Function declarations se mueven al tope (cuerpo incluido) |
| TDZ | `let` y `const` existen pero no se pueden usar antes de la línea |
| Arrow Function | No tiene su propio `this`, ni `arguments`, ni `[[Construct]]` |
| Ámbito Léxico | Se decide por la posición en el código, no por la invocación |
| Closure | La función se lleva su entorno a donde vaya |
| this | Se decide en la invocación, no en la escritura |
| call/apply | Ejecutan inmediatamente con `this` fijado |
| bind | Devuelve nueva función con `this` fijado |
| ?? | Solo `null` y `undefined` activan el fallback |
| ?. | Se detiene en `null/undefined` y devuelve `undefined` |
| Spread (`...`) | Expande elementos (clonar sin mutar) |
| Rest (`...`) | Agrupa argumentos en arreglo |