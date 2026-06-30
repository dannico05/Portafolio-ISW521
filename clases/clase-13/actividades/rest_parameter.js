function sumarTodo(primero, ...resto) {
    console.log(primero);
    console.log(resto);

    return resto.reduce(
        (total, n) => total + n,
        0
    );
}

sumarTodo(1, 2, 3, 4);