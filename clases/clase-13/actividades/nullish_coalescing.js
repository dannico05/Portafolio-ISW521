const descuento = 0;

// || evalúa falsy (0, "", false, null, undefined)
console.log(descuento || 10);  // 10 (0 es falsy por lo que se reemplaza)
console.log(descuento ?? 10);  // 0 (0 NO es nullish)


const nombre = "";

// ?? evalúa solo nullish (null, undefined)
console.log(nombre || "Invitado"); // "Invitado"
console.log(nombre ?? "Invitado"); // "" ("" NO es nullish)