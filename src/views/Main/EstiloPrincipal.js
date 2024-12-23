const EstiloPrincipal = new Object({
  enLinea: {
    barraLateral: {
      width: "18%",
      height: "95%",
      background: "var(--color-contenedor)",
      display: "flex",
      flexFlow: "column nowrap",
      borderRadius: "20px",
    },
    contenidoPrincipal: {
      width: "80%",
      height: "90%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    subContenedor: {
      width: "90%",
      height: "100%",
      background: "var(--color-contenedor)",
      borderRadius: "2%",
    },
  },
  clases: ["borde-x-defecto"],
});

export default EstiloPrincipal;
