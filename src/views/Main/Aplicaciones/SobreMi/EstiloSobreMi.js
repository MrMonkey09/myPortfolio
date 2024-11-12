const EstiloSobreMi = new Object({
  enLinea: {
    encabezado: {
      position: "relative",
      display: "flex",
      flexFlow: "column nowrap",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "30%",

      saludo: {
        height: "30%",
        width: "90%",
        color: "var(--color-extra)",
        display: "flex",
        flexFlow: "row nowrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "0 12px",
        marginTop: "80px",

        icono: {
          width: "3.5%",
          height: "auto",
          fill: "var(--color-extra)",
        },

        texto: {
          fontSize: "2rem",
        },
      },

      nombre: {
        fontSize: "2rem",
        color: "var(--color-fuente-secundaria)",

        cambioColor: {
          color: "var(--color-fuente-primaria)",
        },
      },

      datos: {
        display: "flex",
        flexFlow: "row nowrap",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap:"0 10px"
      },

      bordePunteado: {
        borderTop: "5px dotted var(--color-fuente-primaria)",
        borderLeft: "5px dotted var(--color-fuente-primaria)",
        width: "5rem",
        height: "5rem",
        position: "absolute",
        top: "30px",
        left: "30px",
        borderRadius: "8px 0 0 0",
      },
    },
  },
  clases: ["borde-x-defecto"],
});

export default EstiloSobreMi;
