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
        icono: "assets/images/iconos/img-prueba.svg",
        ejemplo: "Alfredo Rodriguez Markraci",
        ayuda: "",
        necesario: true,
      },
      Correo: {
        id: 2,
        tipo: "correo",
        icono: "assets/images/iconos/img-prueba.svg",
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
        icono: "assets/images/iconos/img-prueba.svg",
        ejemplo: "912345678",
        ayuda:
          "El número de contacto debe contener el dígito 9 seguido de los 8 dígitos correspondientes a móviles Chilenos",
        necesario: true,
      },
      "Red Social Preferente": {
        id: 4,
        tipo: "enlace",
        icono: "assets/images/iconos/img-prueba.svg",
        ejemplo: "https://www.instagram.com/tuperfil/",
        ayuda: "",
        necesario: true,
      },
      Mensaje: {
        id: 5,
        tipo: "cajaTexto",
        icono: "assets/images/iconos/img-prueba.svg",
        ejemplo:
          "Hola soy Alfredo, me gustaría... | Hola soy Alfredo, tengo un emprendimiento podrias ayudarme con...",
        ayuda: "",
        necesario: true,
      },
    },
    contactos: [
      {
        id: "1",
        titulo: "Email",
        descripcion: "alfredo.gestay@gmail.com",
        imagen: "assets/images/iconos/email.svg",
      },
      {
        id: "2",
        titulo: "Whatsapp - Solo mensajes",
        descripcion: "+56 9 64373971",
        imagen: "assets/images/iconos/whatsapp.svg",
      },
      {
        id: "3",
        titulo: "Ciudad, Pais.",
        descripcion: "Antofagasta, Antofagasta, Chile",
        imagen: "assets/images/iconos/chile-bandera.svg",
      },
      {
        id: "4",
        titulo: "GitHub",
        descripcion: "@MrMonkey09",
        imagen: "assets/images/iconos/github.svg",
      },
      {
        id: "5",
        titulo: "LinkedIn",
        descripcion: "@Alfredo Andrés Guerra Estay",
        imagen: "assets/images/iconos/linkedin.svg",
      },
      {
        id: "6",
        titulo: "Instagram",
        descripcion: "@mr0monkey",
        imagen: "assets/images/iconos/instagram.svg",
      },
    ],
  },
};

export default Configuracion;
