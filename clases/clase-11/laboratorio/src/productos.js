// productos.js
export const agregarProducto = (lista, { nombre, precio }) => {
  lista.push({ nombre, precio });
  return { nombre, precio };
};

export const calcularTotal = (lista) => {
  return lista.reduce((total, producto) => total + (producto?.precio ?? 0), 0);
};