const formulario = document.getElementById("formulario");
const tabla = document.getElementById("tablaEstudiantes");

let estudiantes =
JSON.parse(localStorage.getItem("estudiantes")) || [];

mostrarEstudiantes();

formulario.addEventListener("submit", function(e) {

    e.preventDefault();

    const cedula = document.getElementById("cedula").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const nombres = document.getElementById("nombres").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const facultad = document.getElementById("facultad").value.trim();
    const nivel = document.getElementById("nivel").value.trim();
    const paralelo = document.getElementById("paralelo").value.trim();

    const regCedula = /^\d{10}$/;
    const regNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,50}$/;
    const regTelefono = /^\d{10}$/;
    const regCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regParalelo = /^[A-Za-z0-9]{1,3}$/;

    if (!regCedula.test(cedula)) {
        alert("La cédula debe contener 10 dígitos.");
        return;
    }

    if (!regNombre.test(apellidos)) {
        alert("Apellidos inválidos.");
        return;
    }

    if (!regNombre.test(nombres)) {
        alert("Nombres inválidos.");
        return;
    }

    if (!regTelefono.test(telefono)) {
        alert("Teléfono inválido.");
        return;
    }

    if (!regCorreo.test(correo)) {
        alert("Correo electrónico inválido.");
        return;
    }

    if (!regParalelo.test(paralelo)) {
        alert("Paralelo inválido.");
        return;
    }

    const existe = estudiantes.some(
        estudiante => estudiante.cedula === cedula
    );

    if (existe) {
        alert("La cédula ya está registrada.");
        return;
    }

    const estudiante = {
        cedula,
        apellidos,
        nombres,
        direccion,
        telefono,
        correo,
        facultad,
        nivel,
        paralelo
    };

    estudiantes.push(estudiante);

    localStorage.setItem(
        "estudiantes",
        JSON.stringify(estudiantes)
    );

    mostrarEstudiantes();

    formulario.reset();

    alert("Estudiante registrado correctamente.");
});

function mostrarEstudiantes() {

    tabla.innerHTML = "";

    estudiantes.forEach((estudiante, index) => {

        tabla.innerHTML += `
            <tr>
                <td>${estudiante.cedula}</td>
                <td>${estudiante.apellidos}</td>
                <td>${estudiante.nombres}</td>
                <td>${estudiante.direccion}</td>
                <td>${estudiante.telefono}</td>
                <td>${estudiante.correo}</td>
                <td>${estudiante.facultad}</td>
                <td>${estudiante.nivel}</td>
                <td>${estudiante.paralelo}</td>
                <td>
                    <button class="eliminar"
                    onclick="eliminarEstudiante(${index})">
                    Eliminar
                    </button>
                </td>
            </tr>
        `;
    });
}

function eliminarEstudiante(index) {

    const confirmar = confirm(
        "¿Está seguro de eliminar este estudiante?"
    );

    if (confirmar) {

        estudiantes.splice(index, 1);

        localStorage.setItem(
            "estudiantes",
            JSON.stringify(estudiantes)
        );

        mostrarEstudiantes();
    }
}
