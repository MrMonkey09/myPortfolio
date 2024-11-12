const EstiloMenuApp = new Object({
  estilos: {
    aplicacion: {
      width: "100%",
      height: "60px",
      display: "flex",
      flexFlow: "row nowrap",
      justifyContent: "space-around",
      alignItems: "center",
      color: "var(--color-fuente-secundaria)",
      border: "1px solid black",
      borderLeft: "none",
      borderRight: "none",

      img: {
        width: "12%",
        height: "auto",
        fill: "#e8eaed",
      },
      span: {
        width: "77%",
        fontSize: "1.2rem",
      },
    },
  },
  clases: ["borde-x-defecto"],
});

export default EstiloMenuApp;
