// ui.js
export const mostrarProductoAgregado = ({ nombre, precio }) => {
  console.log(`✅ Agregado: ${nombre} - $${precio}`);
};

export const mostrarTotal = (total) => {
  console.log(`💰 Total: $${total}`);
};