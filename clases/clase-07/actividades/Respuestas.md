# Clase #7 (CSS - flexbox)


## Actividad #1 – ¿Qué le pasa a estos elementos al activar flex?

### Respuesta

- **¿Qué le pasa al float: left de .item-a cuando se activa display: flex?:**

Cuando se pasa a un flex, la propiedad float se ignora completamente y el elemento item deja de flotar y s conviente en un flex item 

- **¿Por qué el display: inline de .item-b ya no importa dentro del flex container:**

Dentro de un flex container todos los hijos se vuelven automaticamente flex items, y el display: inline es anulado, por lo que propiedades como vertical-align o el comportamiento en línea pierden todo efecto y el elemento pasa a ser un bloque flexible controlado por Flexbox.

- **¿El margin-top: -20px de .item-c produce margin collapsing igual que en flujo normal?:**

No. El margin collapsing solo ocurre en el flujo normal de bloques y en un flex container los márgenes entre flex items y entre éstos y el contenedor no colapsan. El margin-top: -20px sí moverá el elemento, pero no provocará un colapso.

## Actividad #2 –  ¿En qué eje actua cada propiedad?

### Respuesta


| Propiedad           | Con `flex-direction: row`                                  | Con `flex-direction: column`                               |
| ------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| `justify-content`   | Eje **horizontal**   | Eje **vertical**    |
| `align-items`       | Eje **vertical** – de arriba a abajo| Eje **horizontal** – de izquierda a derecha  |
| `flex-basis`        | Define el **ancho** inicial   | Define el **alto** inicial      |
| `width: 200px`      | Se sobrescribe si `flex-basis` está definido   | No se sobrescribe por `flex-basis` y `width` actúa en el eje cruzado |

> **Nota importante:**  
> - En `row`, `flex-basis` tiene prioridad sobre `width`.  
> - En `column`, `width` controla el ancho y `flex-basis` controla el alto.

# Actividad 3: Bug de alineación

## CSS original

```css
.toolbar {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 80px;
}
```

### Respuesta

- **Con flex-direction: column, ¿justify-content: flex-end mueve los botones a la derecha o hacia abajo?**

Hacia abajo.
Porque con column, el eje principal es vertical. justify-content actúa sobre ese eje, así que flex-end los mueve al final del contenedor (parte inferior).

- **¿Qué eje controla align-items cuando la dirección es column?**

Controla el eje cruzado, que en column es horizontal.
align-items: center centraría los botones horizontalmente (izquierda‑derecha), no verticalmente.

- **¿Cómo corriges el CSS para que los botones queden a la derecha y centrados verticalmente?**

```css
.toolbar {
  display: flex;
  flex-direction: row;      /* Eje principal horizontal */
  justify-content: flex-end; /* Botones a la derecha */
  align-items: center;       /* Centrado vertical */
  height: 80px;
}
```


# Actividad 4: ¿Por qué no funciona align-content?

## CSS original
```css
.galeria {
  display: flex;
  width: 600px;
  height: 300px;
  align-content: space-between; /* sin efecto */
}
.card {
  width: 150px;
  height: 100px;
}
```

### Respuesta

- **¿Cuál es la propiedad que falta para que align-content tenga efecto visual?**

Falta flex-wrap: wrap (y que haya más de una línea de ítems).

- **¿Qué propiedad de alineación sí podría estar actuando aquí aunque align-content no haga nada?**

align-items (por defecto stretch) o justify-content (por defecto flex-start).
En este caso, como no hay wrap, los 5 cards se aplastan en una sola línea (overflow), y align-content solo funciona cuando hay múltiples líneas.

- **Corregí el CSS completo para que 5 cards de 150px hagan wrap y sus líneas se distribuyan verticalmente con space-between**

```css
.galeria {
  display: flex;
  flex-wrap: wrap;           /* Permite que las cards pasen a nueva línea */
  width: 600px;
  height: 300px;
  align-content: space-between; /* Distribuye las líneas verticalmente */
  /* Opcional: justify-content: center; para centrar horizontalmente las líneas */
}

.card {
  width: 150px;
  height: 100px;
  /* Opcional: box-sizing, márgenes, etc. */
}
```


# Actividad 6: PREGUNTAS DE REFLEXIÓN

### Respuesta

- **¿Qué diferencia hay entre flex: 1 y flex-grow: 1? ¿Son exactamente lo mismo?:**

flex: 1 es shorthand: flex-grow:1, flex-shrink:1, flex-basis:0%. flex-grow:1 solo define la capacidad de crecer, pero el flex-basis por defecto sería auto, cambiando la distribución. Con flex: 1 la base es 0, el espacio se reparte puramente por grow.

- **Si quisiéramos que el Sidebar nunca sea menor a 180px sin importar el flex-shrink, ¿qué propiedad agregarían?:**

min-width: 180px; (incluso con flex-shrink no pasará ese límite)

- **Prueben cambiar flex: 3 del Main Content a flex: 5 — ¿Cómo afecta la proporción visual?:**

La proporción total sería 1+5+1 = 7, sidebar 1/7, main 5/7, panel 1/7.
El contenido principal se hace mucho más ancho.