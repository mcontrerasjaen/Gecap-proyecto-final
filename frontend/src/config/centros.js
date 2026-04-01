// src/config/centros.js

export const LISTA_CENTROS = [
  {
    id: 1,
    nombre: "GECAP Madrid Central",
    direccion: "Calle Mayor 1, Madrid",
    cp: "28002",
    factorTrafico: 1.5 // Multiplicador de riesgo (zona congestionada)
  },
  {
    id: 2,
    nombre: "GECAP Pozuelo Norte",
    direccion: "Avenida de Europa 10, Pozuelo",
    cp: "28224",
    factorTrafico: 1.1
  },
  {
    id: 3,
    nombre: "GECAP Sevilla Este",
    direccion: "Avenida de la Innovación, Sevilla",
    cp: "41020",
    factorTrafico: 1.2
  }
];

export const CONFIG_SISTEMA = {
  version: "4.5.0 PRO",
  moneda: "EUR",
  pais: "España"
};