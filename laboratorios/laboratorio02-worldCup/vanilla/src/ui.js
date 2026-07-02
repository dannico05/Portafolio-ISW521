export const renderizarResultado = (cantidad) => {
    const contenedor = document.querySelector("#app");
    contenedor.innerHTML = `<div>
        <h1><h2>Gestión de usuarios</h2></h1>
        <p>La caantidad de usuarios es de: <strong> ${cantidad}</strong> </p>
    </div>`;
};