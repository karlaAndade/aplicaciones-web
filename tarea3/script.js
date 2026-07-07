const formulario = document.getElementById("formulario");
const tabla = document.querySelector("#tabla tbody");

// Mostrar datos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    mostrarDatos();
});

formulario.addEventListener("submit", function(e) {
    e.preventDefault();

    const cliente = {
        cedula: document.getElementById("cedula").value,
        nombre: document.getElementById("nombre").value,
        direccion: document.getElementById("direccion").value,
        telefono: document.getElementById("telefono").value,
        correo: document.getElementById("correo").value
    };

    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    clientes.push(cliente);
    localStorage.setItem("clientes", JSON.stringify(clientes));

    formulario.reset();
    mostrarDatos();
});

function mostrarDatos() {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    tabla.innerHTML = "";

    clientes.forEach(cliente => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${cliente.cedula}</td>
            <td>${cliente.nombre}</td>
            <td>${cliente.direccion}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.correo}</td>
        `;

        tabla.appendChild(fila);
    });
}