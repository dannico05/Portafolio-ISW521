import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

// main.js
import { agregarProducto, calcularTotal } from './productos.js';
import { mostrarProductoAgregado, mostrarTotal } from './ui.js';

// 1. Crear la lista (sin usar var)
const listaProductos = [];

// 2. Agregar un producto (usando destructuring en la llamada)
const productoAgregado = agregarProducto(listaProductos, { 
  nombre: "Teclado", 
  precio: 15000 
});

// 3. Mostrar el producto agregado (template literal)
mostrarProductoAgregado(productoAgregado);

// 4. Calcular y mostrar el total (optional chaining y nullish coalescing ya están dentro de calcularTotal)
const total = calcularTotal(listaProductos);
mostrarTotal(total);