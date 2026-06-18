# Clase #9 - Diseño Responsivo, Arquitectura CSS y Frameworks

# TEMA 1 • LA FÍSICA DEL VIEWPORT 

## Actividad 1 • El cliente del sitio diminuto

**Caso de estudio:**  
Un cliente reporta: *"Mi sitio se ve diminuto en el celular; mis usuarios hacen zoom con los dedos para leer cualquier cosa. En la computadora se ve perfecto."*


### 1. Hipótesis principal
El sitio web **carece de la etiqueta `<meta name="viewport">`** en el `<head>` del HTML.

Al no encontrar esta instrucción, los navegadores móviles (Chrome, Safari, etc.) activan su "modo de compatibilidad" y simulan un ancho de pantalla de escritorio (generalmente **980px**). Como el celular físicamente mide ~375px, el navegador **escala (encoge) todo el contenido** para que quepa en esos 375px, haciendo que los textos y botones se vean diminutos.

### 2. Verificación en 30 segundos
Sin necesidad de leer todo el código, sigo estos pasos en las herramientas de desarrollador:

1. Abro el sitio en Chrome/Firefox y presiono **F12** (o clic derecho → *Inspeccionar*).
2. Hago clic en el ícono de **"Alternar barra de herramientas de dispositivo"** (ícono de celular/tablet, o presiono `Ctrl+Shift+M`).
3. Selecciono cualquier modelo de celular (ej. iPhone 12/SE o Pixel 5).
4. Reviso rápidamente el `<head>` del código fuente (pestaña *Elements* o *Inspector*).

- Si **no veo** la etiqueta `<meta name="viewport"...>` → **hipótesis confirmada**.
- Si veo la etiqueta pero con `width=1024` o un valor fijo grande → también es la causa.

*(En un celular real, puedo escribir `document.querySelector('meta[name="viewport"]')` en la consola remota; si devuelve `null`, es eso).*

### 3. Fix exacto
El **fix exacto** es agregar la siguiente etiqueta **dentro de la etiqueta `<head>`** del archivo HTML (justo arriba de las hojas de estilo CSS):

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Actividad 2 • Calcule el tamaño real

**Ejercicio de cálculo** (2 min • individual, en papel)

Dada la regla CSS:
```css
h1 {
  font-size: clamp(1.5rem, 4vw + 0.5rem, 3rem);
}
```

Una pantalla de 800 px de ancho, tiene una fuente que mide exactamente 40 px.

el ancho de pantalla del techo de 3rem empieza a mandar a partir de los 1000 px de ancho de pantalla. En ese punto, el valor preferido da exactamente 48px y, para pantallas más grandes, quedaría por encima del techo, por lo que el navegador fija el tamaño en 3rem.


# TEMA 2 • MEDIA QUERIES Y MOBILE-FIRST 

## Actividad 3 • Lea el código como el navegador

**Consigna:** Para cada bloque, responda en una línea: ¿qué hace y cuándo, exactamente, se activa?

## Bloque A (corregido)
```css
@media screen and (max-width: 599px) {
  .galeria {
    grid-template-columns: 1fr;
  }
}
```

¿Qué hace?
Convierte la cuadrícula (.galeria) en una sola columna de 1 fracción.

¿Cuándo se activa?
Se activa exactamente cuando el medio es screen (pantalla) y el ancho del viewport es menor o igual a 599 píxeles (dispositivos móviles o tablets pequeñas en vertical).


## Bloque B (corregido)
```css
@media (min-width: 768px) and (orientation: landscape) {
  aside {
    display: block;
  }
}
```

¿Qué hace?
Hace visible el elemento <aside> (lo muestra como bloque).

¿Cuándo se activa?
Se activa exactamente cuando el ancho del viewport es mayor o igual a 768 píxeles y la orientación del dispositivo es horizontal.


## Bloque C (corregido)
```css
@media print {
  nav,
  footer,
  .anuncios {
    display: none;
  }
}
```

¿Qué hace?
Oculta/elimina la barra de navegación (nav), el pie de página (footer) y todos los elementos con clase .anuncios.

¿Cuándo se activa?
Se activa exactamente cuando el usuario imprime la página o activa la vista previa de impresión en el navegador. Esto evita que elementos no relevantes para el papel aparezcan en la copia impresa.



# Actividad 4 • Lea el código como el navegador

## Consigna
Para cada bloque, responda en una línea: **¿qué hace y cuándo, exactamente, se activa?**


## Bloque A

```css
@media screen and (max-width: 599px) {
  .galeria {
    grid-template-columns: 1fr;
  }
}
```

### ¿Qué hace?
Convierte la cuadrícula (`.galeria`) en una sola columna de 1 fracción.

### ¿Cuándo se activa?
Se activa exactamente cuando el medio es `screen` (pantalla) y el ancho del viewport es menor o igual a **599 px**.

**Nota:** Usa `max-width`, por lo que sigue una lógica **desktop-first**.


## Bloque B

```css
@media (min-width: 768px) and (orientation: landscape) {
  aside {
    display: block;
  }
}
```

### ¿Qué hace?
Hace visible el elemento `<aside>` mostrándolo como bloque.

### ¿Cuándo se activa?
Se activa cuando:

- El ancho del viewport es mayor o igual a **768 px**.
- La orientación es **horizontal (landscape)**.

Una tablet de 800 px en orientación vertical **no activa** esta regla.



## Bloque C

```css
@media print {
  nav,
  footer,
  .anuncios {
    display: none;
  }
}
```

### ¿Qué hace?
Oculta:

- `nav`
- `footer`
- Elementos con la clase `.anuncios`

### ¿Cuándo se activa?
Cuando el usuario imprime la página o abre la vista previa de impresión.



# Actividad 5 • Refactorice a Mobile-First

## Consigna
Convierta este CSS a **mobile-first**. Determine qué queda como base y qué se mueve a `@media (min-width)`.

### CSS original (Desktop-First)

```css
.products {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

@media (max-width: 1023px) {
  .products {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .products {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

## Solución 5 • El mismo diseño, lógica invertida

### CSS refactorizado (Mobile-First)

```css
/* BASE = versión móvil */
.products {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 600px) {
  .products {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .products {
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
  }
}
```

### Detalle profesional
`max-width: 599px` se convierte en `min-width: 600px`.

Ese desfase de **1 píxel** (*off-by-one*) es una fuente común de errores cuando se mezclan ambos enfoques.



# Actividad 6 • Encuentre los 3 olores de código

## Consigna
Hay al menos tres olores de código:

1. Uno de rendimiento.
2. Uno de mantenimiento.
3. Uno conceptual.

### Código

```css
.banner-promo {
  width: 1400px;
  background-image: url('promo-4k.jpg');
}

@media (max-width: 1200px) {
  .banner-promo { width: 1000px; }
}

@media (max-width: 992px) {
  .banner-promo { width: 750px; }
}

@media (max-width: 768px) {
  .banner-promo { width: 580px; }
}

@media (max-width: 576px) {
  .banner-promo { display: none; }
}
```

## Solución 6 • Los tres olores

| Tipo | Descripción |
|--------|-------------|
| Rendimiento | El móvil procesa todas las reglas y puede descargar `promo-4k.jpg` aunque el banner termine oculto. |
| Mantenimiento | El ancho se sobrescribe cuatro veces. Bastaría con `width: 100%` y `max-width: 1400px`. |
| Conceptual | Usa anchos fijos para dispositivos específicos en lugar de permitir que el contenido fluya. |

### Moraleja
Desktop-first suele multiplicar reglas para conseguir algo que mobile-first logra con menos código.



# Actividad 7 • ¿Breakpoint para el teléfono del gerente?

## Consigna

Un compañero propone:

```css
@media (max-width: 393px)
```

porque es el ancho exacto del iPhone 15.

¿Acepta o rechaza la propuesta?

Dé dos argumentos técnicos.

### Matiz
¿Y si en 393 px el diseño sí se ve mal?

## Solución 7 • Rechazar el parche, rescatar el síntoma

### ¿Por qué se rechaza?

1. Un breakpoint ligado a un único modelo queda obsoleto rápidamente.
2. Existen decenas de anchos distintos en el mercado.

### El matiz profesional

Si el diseño se rompe en 393 px:

- El problema es real.
- Pero la solución correcta es mejorar la fluidez del diseño:

```css
minmax()
flex-wrap
max-width
```

y no crear un breakpoint para un teléfono específico.

### Frase para entrevista

> Los breakpoints se definen por contenido y familias de dispositivos, no por resoluciones de una marca. Si un ancho específico se rompe, el problema es la fluidez de la base, no la falta de un breakpoint.



# TEMA 3 • Sistemas de Diseño con Variables CSS

# Actividad 8 • De valores quemados a tokens

## Consigna
Defina `:root` y reescriba las reglas usando tokens.

### CSS original

```css
.boton-comprar {
  background: #0a7d4f;
  color: #ffffff;
  padding: 16px;
  border-radius: 8px;
}

.enlace-activo {
  color: #0a7d4f;
}

.tarjeta-promo {
  border: 2px solid #0a7d4f;
  padding: 16px;
  border-radius: 8px;
}
```

## Solución 8

```css
:root {
  --color-marca: #0a7d4f;
  --color-sobre-marca: #ffffff;
  --espaciado-base: 16px;
  --radio-suave: 8px;
}

.boton-comprar {
  background: var(--color-marca);
  color: var(--color-sobre-marca);
  padding: var(--espaciado-base);
  border-radius: var(--radio-suave);
}

.enlace-activo {
  color: var(--color-marca);
}

.tarjeta-promo {
  border: 2px solid var(--color-marca);
  padding: var(--espaciado-base);
  border-radius: var(--radio-suave);
}
```

### Regla de oro

Nombrar por intención:

✅ `--color-marca`

❌ `--verde`



# Actividad 9 • El cliente quiere "más aire" en escritorio

## Caso

Proyecto con:

- 800 líneas CSS
- 23 clases con paddings y márgenes quemados

El cliente pide:

> En escritorio quiero todo más aireado.

## Solución 9

| Aspecto | Método tradicional | Design Tokens |
|----------|-------------------|---------------|
| Hoy | Reescribir 23 clases. | Las clases usan `var(--espaciado-base)` y se redefine un token. |
| Próximo cambio | Repetir todo. | Cambiar un único valor. |
| Riesgo | Inconsistencias. | Todas las clases usan la misma fuente. |

### Moraleja

La arquitectura se paga en mantenimiento.



# TEMA 4 • Preprocesadores SASS/SCSS

# Actividad 10 • La pregunta trampa de la entrevista

## Código

```scss
// estilos.scss
$tema-fondo: #ffffff;

body {
  background: $tema-fondo;
}
```

```javascript
boton.addEventListener('click', () => {
  window.$temaFondo = '#0d1117';
});
```

## Solución 10

### ¿Por qué falla?

Cuando el navegador ejecuta JavaScript:

- `$tema-fondo` ya no existe.
- SASS lo reemplazó durante la compilación.

### Corrección

#### CSS

```css
:root {
  --tema-fondo: #ffffff;
}

body {
  background: var(--tema-fondo);
}
```

#### JavaScript

```javascript
boton.addEventListener('click', () => {
  document.documentElement.style.setProperty(
    '--tema-fondo',
    '#0d1117'
  );
});
```



# Actividad 11 • Usted es el compilador

## Entrada SCSS

```scss
.card {
  border-radius: 8px;

  .card-título {
    font-weight: bold;
  }

  &:hover {
    transform: scale(1.02);
  }

  &--destacada {
    border: 2px solid gold;
  }
}
```

## CSS generado

```css
.card {
  border-radius: 8px;
}

.card .card-título {
  font-weight: bold;
}

.card:hover {
  transform: scale(1.02);
}

.card--destacada {
  border: 2px solid gold;
}
```

### La trampa

```scss
&--destacada
```

genera:

```css
.card--destacada
```

No crea un descendiente.

Es una clase nueva siguiendo el patrón **BEM**.



# Actividad 12 • Diseñe la arquitectura de un e-commerce

## Consigna

Diseñar:

1. Lista de parciales (`_archivo.scss`)
2. Al menos un mixin reutilizable

## Solución 12

### Fundamentos

```text
_variables.scss
_mixins.scss
```

### Base

```text
_reset.scss
_tipografia.scss
```

### Componentes

```text
_botones.scss
_tarjetas.scss
_formularios.scss
```

### Páginas

```text
_catalogo.scss
_checkout.scss
_blog.scss
```

### Archivo principal

```scss
@use 'variables';
@use 'mixins';
@use 'botones';
@use 'tarjetas';
@use 'formularios';
```

### Mixin ejemplo

```scss
@mixin tarjeta-producto(
  $sombra: 0 2px 8px rgba(0,0,0,0.1)
) {
  border-radius: 8px;
  padding: 16px;
  box-shadow: $sombra;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
}
```


# TEMA 5 • Frameworks CSS

# Actividad 13 • Lea Bootstrap como crítico

## HTML

```html
<div class="alert alert-warning d-flex align-items-center" role="alert">
  <strong>¡Atención!</strong>&nbsp; Su sesión expira en 5 minutos.
  <button class="btn btn-warning btn-sm ms-auto">
    Renovar
  </button>
</div>
```

## Solución 13

### ¿Cómo se verá?

- Caja amarilla.
- Texto oscuro.
- Botón amarillo pequeño.
- Botón alineado a la derecha.

### ¿Qué revela?

Bootstrap proporciona un vocabulario visual listo para usar.

### Opciones para cambiar el botón

#### a) Sobrescribir CSS

Ventaja: rápido.

Desventaja: conflictos de especificidad.

#### b) Recompilar variables SASS

Ventaja: limpio.

Desventaja: requiere tooling.

#### c) Estilos inline

Considerado una mala práctica porque rompe el sistema.

### ¿Cuánto CSS escribió el desarrollador?

**Cero líneas.**

Solo utilizó clases proporcionadas por Bootstrap.


# Actividad 14 • Usted es el arquitecto: elija framework

## Consigna

Usted es el arquitecto. Elija el framework más adecuado para cada escenario y justifique con argumentos técnicos.

| Escenario A · La startup | Escenario B · La marca premium |
|--------------------------|--------------------------------|
| MVP de panel administrativo para validar con inversionistas en 3 semanas. El diseño visual no es prioridad; que funcione, sí. Equipo: 2 desarrolladores, sin diseñador. | E-commerce de café premium con identidad visual fuerte y única. Hay diseñador UX con Design System en Figma. Plazo: 3 meses. |

### Entregable por escenario

- Framework elegido.
- 2 argumentos técnicos.
- 1 riesgo de la elección.

Utilice conceptos como:

- Tokens
- JIT
- CSS muerto
- Look genérico
- Mobile-first
- Design System



# Solución 14 • La decisión razonada

## Escenario A → Bootstrap

### Framework elegido
**Bootstrap**

### Argumento 1
Bootstrap ofrece una gran cantidad de componentes listos para usar, lo que permite desarrollar un MVP rápidamente con un equipo pequeño y sin diseñador.

### Argumento 2
El framework incluye un sistema responsive mobile-first y una estructura visual consistente, reduciendo el tiempo dedicado al diseño y maquetación.

### Riesgo
Si el MVP evoluciona a producto final, personalizar Bootstrap para construir una identidad visual propia puede generar deuda técnica y aumentar la complejidad del mantenimiento.



## Escenario B → Tailwind CSS

### Framework elegido
**Tailwind CSS**

### Argumento 1
Los design tokens definidos en Figma pueden trasladarse fácilmente a la configuración de Tailwind, manteniendo coherencia entre diseño y desarrollo.

### Argumento 2
Gracias al compilador JIT (Just In Time), solo se genera el CSS utilizado por la aplicación, reduciendo CSS muerto y mejorando el rendimiento.

### Riesgo
Requiere disciplina para crear componentes reutilizables y existe una curva de aprendizaje inicial debido a la gran cantidad de utilidades y convenciones propias.



## Criterio profesional

No existe una única respuesta correcta.

Lo importante es justificar la elección con argumentos técnicos sólidos considerando:

- Tiempo disponible.
- Tamaño del equipo.
- Necesidades de personalización.
- Rendimiento.
- Mantenibilidad.
- Objetivos del negocio.
