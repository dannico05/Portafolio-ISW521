# Clase #6 (Accesibilidad y CSS)


## Actividad de Análisis #1 – Auditoría de Contraste

**Enunciado:**  
Botón con fondo `#0D6EFD` y texto `#FFFFFF`.  
Calcular ratio, evaluar AA/AAA y conformidad para 16px normal.

### Respuesta

- **Parte A:** Ratio ≈ Ratio = (1.0 + 0.05) / (0.183 + 0.05) = 1.05 / 0.233 = **4.51:1**
- **Parte B:** Cumple AA porque es ≥4.5:1, y no cumple con AAA porque requiere ≥7:1  
- **Parte C:** Alcanza nivel AA (texto normal, 16px)


## Actividad de Análisis #2 – Trampa de Teclado (Modal)

**Enunciado:**  
Modal con botones "Confirmar" y "Cancelar". El foco se escapa al fondo al presionar Tab.

### Respuesta

1. **Explicación técnica:**  
   El navegador no aísla el modal; trata todos los elementos focusables en una sola lista. Al llegar al último elemento del modal, el siguiente Tab lleva el foco fuera (fondo). 

2. **Solución conceptual:**  
   Interceptar Tab/Shift+Tab, detectar primero/último elemento y redirigir el foco, usando `preventDefault()`. 

3. **Pseudocódigo:**  
```javascript
// 1. Obtener elementos enfocables (excluye deshabilitados)
   const focusables = modal.querySelectorAll(
  'a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]'
);

// 2. Escuchar la tecla Tab y ciclar dentro del modal
  modal.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;

  const primero = focusables[0];
  const ultimo = focusables[focusables.length - 1];
  const activo = document.activeElement;

  // Tab sin Shift: si es el último, ir al primero
  if (!event.shiftKey && activo === ultimo) {
    primero.focus();
    event.preventDefault();
  }
  // Shift+Tab: si es el primero, ir al último
  else if (event.shiftKey && activo === primero) {
    ultimo.focus();
    event.preventDefault();
  }
});

// 3. Enfocar el primer elemento al abrir el modal
    primero.focus();
```


## Actividad de Análisis #3 – Diagnóstico ARIA

**Enunciado:**  
Fragmento HTML con múltiples errores de accesibilidad. Se piden al menos 4 problemas.

### Respuesta

| # | Problema | Impacto en AT | Corrección |
|---|----------|---------------|-------------|
| 1 | El `div role="button"` tiene `aria-label="Menu"` **y** la imagen interna `alt="Menu principal"` → redundancia de nombre accesible. | El lector de pantalla anuncia ambos textos, creando confusión. | Quitar `aria-label` o poner `alt=""` en la imagen. |
| 2 | El `<nav>` tiene `role="navigation"` – redundante porque `<nav>` ya tiene ese rol implícito. | Ningún impacto negativo grave, pero código innecesario. | Eliminar `role="navigation"`. |
| 3 | El `<h2 id="nav-title">` tiene `aria-hidden="true"` pero su `id` es referenciado por `aria-labelledby="nav-title"` en el `<nav>`. Los lectores de pantalla no pueden leer un elemento oculto. | El `<nav>` pierde su nombre accesible; el usuario escucha solo "región de navegación" sin contexto. | Quitar `aria-hidden="true"` del `<h2>`. |
| 4 | `aria-live="assertive"` usado para un mensaje de bienvenida estático. `assertive` interrumpe agresivamente; el mensaje no es urgente. | El lector de pantalla interrumpe cualquier anuncio en curso, mala experiencia. | Cambiar a `aria-live="polite"` o eliminar `aria-live` si no es dinámico. |

**Problema adicional que encontre fue:**  
El `div role="button"` no responde a las teclas `Enter` o `Espacio` de forma nativa. Se debe agregar un manejador `onkeydown` para simular el comportamiento de un botón real.


## Actividad de Análisis #4 – Batalla de Selectores

**Enunciado:**  
HTML y CSS dados. Determinar color de cada párrafo y justificar con especificidad.

### Respuesta

- **Párrafo A** (`<p class="texto destacado">`): Color `green` por `#contenido p` (especificidad 101).  
- **Párrafo B** (`<p class="texto">`): Color `green` por la misma regla.  
- **Conclusión:**  Los dos parrafos son verdes, ya que un selector con ID supera cualquier combinación de clases, esto porque su valor es de 101.

**Cálculo de especificidades:**

| Regla | Especificidad | Valor |
|-------|---------------|-------|
| `p` | 0,0,1 | 1 |
| `.texto` | 0,1,0 | 10 |
| `#contenido p` | 1,0,1 | **101** |
| `.texto.destacado` | 0,2,0 | 20 |
| `main p.texto` | 0,1,2 | 12 |