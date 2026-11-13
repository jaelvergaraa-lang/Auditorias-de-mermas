"use strict";

const CLAVE_AUDITORIAS = "auditoriasMermas";
const formulario = document.getElementById("formAuditoria");
const campoId = document.getElementById("idRollo");
const campoTotales = document.getElementById("mtsTotales");
const campoDefecto = document.getElementById("mtsDefecto");
const tablaMermas = document.getElementById("tablaMermas");

class RolloAuditado {
    constructor(id, metrosTotales, metrosDefecto) {
        this.id = id;
        this.metrosTotales = metrosTotales;
        this.metrosDefecto = metrosDefecto;
    }

    calcularPorcentajeDefecto() {
        return (this.metrosDefecto / this.metrosTotales) * 100;
    }

    obtenerEstadoCalidad() {
        return this.metrosDefecto === 0 ? "Sin defectos" : "Con defectos";
    }
}

function cargarAuditorias() {
    const datosGuardados = localStorage.getItem(CLAVE_AUDITORIAS);

    if (datosGuardados === null) {
        return [];
    }

    // JSON guarda los datos del rollo. Se reconstruye cada objeto para recuperar sus métodos.
    return JSON.parse(datosGuardados).map(({ id, metrosTotales, metrosDefecto }) =>
        new RolloAuditado(id, metrosTotales, metrosDefecto)
    );
}

function mostrarAuditorias(auditorias) {
    tablaMermas.replaceChildren();

    if (auditorias.length === 0) {
        const celda = tablaMermas.insertRow().insertCell();
        celda.colSpan = 4;
        celda.className = "text-center text-secondary";
        celda.textContent = "Todavía no hay auditorías registradas.";
        return;
    }

    for (const rollo of auditorias) {
        const fila = tablaMermas.insertRow();
        fila.insertCell().textContent = rollo.id;
        fila.insertCell().textContent = rollo.metrosTotales;
        fila.insertCell().textContent = rollo.calcularPorcentajeDefecto().toFixed(2) + " %";

        const estado = fila.insertCell();
        estado.textContent = rollo.obtenerEstadoCalidad();
        estado.className = rollo.metrosDefecto === 0 ? "text-success" : "text-danger";
    }
}

function guardarAuditoria(evento) {
    evento.preventDefault();

    const id = campoId.value.trim();
    const metrosTotales = campoTotales.valueAsNumber;
    const metrosDefecto = campoDefecto.valueAsNumber;

    if (id === "") {
        alert("Escribe el ID del rollo.");
        campoId.focus();
        return;
    }

    if (!Number.isFinite(metrosTotales) || metrosTotales <= 0) {
        alert("Los metros totales deben ser mayores que cero.");
        campoTotales.focus();
        return;
    }

    if (!Number.isFinite(metrosDefecto) || metrosDefecto < 0) {
        alert("Los metros con defecto deben ser cero o mayores.");
        campoDefecto.focus();
        return;
    }

    if (metrosDefecto > metrosTotales) {
        alert("Los metros con defecto no pueden superar los metros totales.");
        campoDefecto.focus();
        return;
    }

    const rollo = new RolloAuditado(id, metrosTotales, metrosDefecto);
    let auditorias;

    try {
        auditorias = cargarAuditorias();
        auditorias.push(rollo);
        localStorage.setItem(CLAVE_AUDITORIAS, JSON.stringify(auditorias));
    } catch {
        alert("No se pudo guardar la auditoría. Revisa si tu navegador permite el almacenamiento local.");
        return;
    }

    mostrarAuditorias(auditorias);
    formulario.reset();
    campoId.focus();
}

formulario.addEventListener("submit", guardarAuditoria);

try {
    mostrarAuditorias(cargarAuditorias());
} catch {
    const celda = tablaMermas.insertRow().insertCell();
    celda.colSpan = 4;
    celda.className = "text-danger";
    celda.textContent = "No se pudieron cargar las auditorías guardadas.";
}
