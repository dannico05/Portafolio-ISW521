# Actividad 1: Compilación, ejecución y tipado inferido

## Enunciado
¿El error de que "nombre" no existe se detecta en tiempo de compilación o en tiempo de ejecución? Justifiquen pensando en lo que ya intuyen sobre strictNullChecks

Dado el siguiente fragmento de código:

```javascript
obtenerUsuario().nombre.toUpperCase()
```
Respuesta: 
Se detiene en tiempo de ejecución.
Depende completamente si typeScript porque tiene activado el StrictNullChecks y esto lo que hce es que se detenga en el tiempo de compilación sin llegar al tiempo de ejecución.


# Actividad 2: Los tipos base y los tipos que hay que usar con cuidado

## Enunciado
Tienen la función procesar. Refactorícenla para que use unknown en vez de any, agregando la validación necesaria para que siga funcionando con números y sea
imposible romperla con un string.

El código original presenta una grave vulnerabilidad de tipado:

```typescript
function procesar(input: any) { 
    return input.toFixed(2); 
}
```
Respuesta: Cambia la firma a función procesada y cambia el input a unknown. Se hace una validación extra que no acepte nulos ni infinitos.


# Actividad 3: Type Aliases — Ponerle nombre a un tipo

## Enunciado
Una API de este curso devuelve la disponibilidad de un laboratorio así: puede estar `'disponible'`, `'ocupado'` o `'en-mantenimiento'`, y además trae la cantidad de computadoras libres como número.  
**Modelen esa respuesta usando un solo type alias.**

## Resolución

### 1. Análisis de la estructura

La respuesta de la API es un **objeto** que contiene dos campos:

| Campo | Tipo | Valores posibles |
| :--- | :--- | :--- |
| `estado` (o `disponibilidad`) | `string` (literal) | `'disponible'`, `'ocupado'` o `'en-mantenimiento'` |
| `computadorasLibres` | `number` | Cualquier número entero no negativo (en un modelo más estricto podríamos usar `number` y luego validar) |

Para representar esto con un **único type alias**, debemos definir el tipo completo del objeto que la API retorna.


### 2. Código del type alias

```typescript
type RespuestaLaboratorio = {
    estado: 'disponible' | 'ocupado' | 'en-mantenimiento';
    computadorasLibres: number;
};
```


# Actividad de Análisis: Interfaces — El contrato estructural de un objeto

## Enunciado
Diseñen la interfaz `Factura` para el sistema de matrícula de la UTN. Debe incluir, mínimo: número de factura, nombre del estudiante, monto total, y una lista de los cursos matriculados (código y créditos por curso). Decidan qué campos son obligatorios y cuáles opcionales.

## Resolución

### 1. Diseño de la interfaz

Para cumplir con los requisitos mínimos y añadir valor al modelo, definimos:

- Una interfaz para el detalle de cada curso.
- La interfaz `Factura` propiamente dicha, con campos obligatorios y opcionales.

```typescript
// Detalle de un curso matriculado
interface CursoMatriculado {
    codigo: string;          // Obligatorio: identifica el curso
    creditos: number;        // Obligatorio: para cálculos académicos y financieros
    nombre?: string;         // Opcional: útil para mostrar en la factura
    costoPorCredito?: number; // Opcional: si el costo varía por curso
}

// Interfaz principal de la factura
interface Factura {
    // Identificación
    numeroFactura: string;    // Obligatorio
    fechaEmision: Date;       // Obligatorio
    fechaVencimiento?: Date;  // Opcional

    // Datos del estudiante
    nombreEstudiante: string; // Obligatorio
    idEstudiante?: string;    // Opcional

    // Aspectos financieros
    subtotal?: number;        // Opcional
    impuestos?: number;       // Opcional
    descuentos?: number;      // Opcional
    montoTotal: number;       // Obligatorio

    // Cursos matriculados (mínimo uno)
    cursos: CursoMatriculado[]; // Obligatorio

    // Metadatos adicionales
    estado?: 'pagada' | 'pendiente' | 'vencida' | 'anulada'; // Opcional
    metodoPago?: 'efectivo' | 'tarjeta' | 'transferencia' | 'otros'; // Opcional
    observaciones?: string;   // Opcional
}
```


# Actividad de Análisis: Type o Interface — La decisión que sí importa

## Enunciado
Modelar la respuesta de una API de autenticación, que puede devolver dos formas completamente distintas: un login exitoso con un token, o un login fallido con un mensaje de error.  
**¿Usarían `type` o `interface` para esto? Justifiquen con lo que acabamos de ver.**

## Resolución

### 1. Análisis del problema

La respuesta de la API puede ser de dos formas mutuamente excluyentes:

- **Login exitoso** → devuelve un objeto con, por ejemplo, `token: string` y tal vez `usuario: { ... }`.
- **Login fallido** → devuelve un objeto con `error: string` y posiblemente `codigo: number`.

Ambas son **estructuras diferentes**, no hay una relación de herencia ni composición entre ellas. Representan un **estado alternativo** de la misma operación.

### 2. ¿Qué herramienta elegir?

| Característica | `type` | `interface` |
| :--- | :--- | :--- |
| **Uniones** | Soporte nativo (`type Respuesta = Exito \| Fracaso`) | No se puede definir una unión directamente |
| **Intersecciones** | Soporte nativo | Se puede extender con `extends` |
| **Declaración de objeto** | Perfecto para objetos | Perfecto para objetos |
| **Extensibilidad / herencia** | No se puede extender (solo con intersección) | Se puede extender con `extends`, pensado para APIs abiertas |
| **Declaración múltiple (merge)** | No se puede redeclarar el mismo alias | Permite *declaration merging* (útil para bibliotecas) |

En este caso, necesitamos **una unión de dos tipos de objeto**. La herramienta adecuada es `type`, porque es la única que permite definir un *union type* directamente.

### 3. Solución propuesta con `type`

```typescript
// Definimos los dos posibles resultados
type LoginExitoso = {
    token: string;
    usuario: {
        id: string;
        nombre: string;
        email: string;
    };
    expiracion?: Date; // opcional
};

type LoginFallido = {
    error: string;
    codigo: number;
    detalles?: string; // opcional
};

// Union type que representa la respuesta completa de la API
type RespuestaAutenticacion = LoginExitoso | LoginFallido;
```