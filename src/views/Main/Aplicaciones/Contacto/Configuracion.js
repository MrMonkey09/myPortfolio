const Configuracion = {
  icono: "",
  contenido: {
    encabezado: {
      saludo: "Alguna duda?",
      nombre01: "Contácteme",
      nombre02: "Sin Compromiso 🫡",
      datos: {
        ciudad: "Antofagasta, Chile",
        correo: "alfredoa_gestay@outlook.com",
        github: "MrMonkey09",
      },
    },
    formulario: {
      Nombre: {
        id: 1,
        tipo: "texto",
        icono: "src\\assets\\images\\img-prueba.svg",
        ejemplo: "Alfredo Rodriguez Markraci",
        ayuda: "",
        necesario: true,
      },
      Correo: {
        id: 2,
        tipo: "correo",
        icono: "src\\assets\\images\\img-prueba.svg",
        minimo: "6",
        ejemplo: "alfredo@makraci.com",
        ayuda:
          "El correo debe ser mayor a 6 caracteres dada la seguridad del sistema",
        necesario: true,
      },
      "N° de Contacto": {
        id: 3,
        tipo: "numero",
        maximo: "9",
        minimo: "9",
        icono: "src\\assets\\images\\img-prueba.svg",
        ejemplo: "912345678",
        ayuda:
          "El número de contacto debe contener el dígito 9 seguido de los 8 dígitos correspondientes a móviles Chilenos",
        necesario: true,
      },
      "Red Social Preferente": {
        id: 4,
        tipo: "enlace",
        icono: "src\\assets\\images\\img-prueba.svg",
        ejemplo: "https://www.instagram.com/tuperfil/",
        ayuda: "",
        necesario: true,
      },
    },
  },
};

export default Configuracion;
