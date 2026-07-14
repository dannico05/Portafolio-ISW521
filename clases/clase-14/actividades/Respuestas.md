# Actividad 1

## Análisis de fragmentos de código

### Fragmento 1
```js
setTimeout(() => console.log('hola'), 1000);
```

(A) ¿API pura de ECMAScript o Web API?
Web API del navegador.
setTimeout no está definido en ECMAScript (ECMA‑262), sino que lo proporciona el entorno. Es una API del entorno hospedador.

(B) ¿Qué pasaría en Node.js?
Funcionaría con normalidad.
Node.js también implementa setTimeout como una función global, por lo que el mensaje se imprimiría después de ~1000 ms sin errores.

### Fragmento 2
```js
const arr = (1, 2, 3].map(x = x*2);
```

(A) ¿API pura de ECMAScript o Web API?
API pura de ECMAScript.
Array.prototype.map es un método estándar definido en la especificación ECMAScript. No depende del navegador.

(B) ¿Qué pasaría en Node.js?
Lanzaría un error de sintaxis (SyntaxError).
Porque el código tendrìa dos errores de sintaxis:
- El literal de array está mal escrito: debería ser [1, 2, 3].
- La arrow function está mal definida: x = x*2 debería ser x => x*2.
En Node.js el código ni siquiera llegaría a ejecutarse.
Si se corrigieran esos errores entonces funcionaría perfectamente en Node.js, ya que map es nativo del lenguaje.

### Fragmento 3
(A) ¿API pura de ECMAScript o Web API?
Web API del navegador.
navigator es un objeto global proporcionado por el navegador. La propiedad onLine indica el estado de conectividad de la red. No forma parte de ECMAScript.

(B) ¿Qué pasaría en Node.js?
Lanzaría un error ReferenceError: navigator is not defined.
El objeto navigator no existe en el entorno global de Node.js por defecto. Para acceder a información similar en Node.js se necesitaría un módulo como os o net, o un polyfill como jsdom.


# Actividad 2

## Actividad de Análisis 

### HTML de ejemplo
```html
<ul id="lista">
  <li><button>Uno</button></li>
  <li><button>Dos</button></li>
  <li><button>Tres</button></li>
</ul>
```

(A) Selección con querySelectorAll
```js
const segundoLi = document.querySelectorAll('#lista li')[1];
// o también (nth‑child)
const segundoLiAlt = document.querySelector('#lista li:nth-child(2)');
```

(B) Selección con recorido relativo (trasversal)
```js
const primerLi = document.querySelector('#lista li:first-child');
const segundoLi = primerLi.nextElementSibling;
```

Respuesta: Ambos funcionarian despues de agregar al cuarto en la primera posición, tras ejecutarlo 


# Actividad 3

## Actividad de Análisis 

### Fragmento original (con errores de sintaxis)
```js
perfilDiv.innerHTML = '<h3>' + nombreUsuario + '</h3>';
```

// Ejemplo de entrada maliciosa
```js
nombreUsuario = '<img src=x onerror="alert(\'XSS\')">';
```
Al asignar a innerHTML, el navegador interpreta y ejecuta el HTML, esto provoca el robo de cookies, redirecciones, o ejecución de scripts arbitrarios.

Lo mejor es usar textcontent en vez de innerHTML cuando se insrtar datos,
Corrección:
```js
perfilDiv.textContent = nombreUsuario;
// O si se quiere mantener la etiqueta <h3>:
const h3 = document.createElement('h3');
h3.textContent = nombreUsuario;
perfilDiv.appendChild(h3);
```

Uso de classList para marcar visualmente como "inválido"
Respuesta: campoInput.classlist.add('campo-invalido') aplica el estilo de erroros sin sobreescribir otras clases que el input ya tuviera 


# Actividad 4

## Actividad de Análisis 

### Optimización para minimizar reflows

Código original (ineficiente)
```js
for (let i = 0; i < 200; i++) {
  const li = document.createElement('li');
  li.textContent = `Elemento ${i}`;
  document.querySelector('ul').append(li);
}
```

Código optimizado (usando DocumentFragment)
```js
const fragment = document.createDocumentFragment();
const ul = document.querySelector('ul');

for (let i = 0; i < 200; i++) {
  const li = document.createElement('li');
  li.textContent = `Elemento ${i}`;
  fragment.append(li);
}

ul.append(fragment);
```

Porque reduce los reflows de 200 a solo 1, al construir todos los nuevos elementos en un fragmento en memoria y anexarlos al DOM en una única operación al final, por lo que disminuye el tiempo de duración al la hora de cargar los elementos 