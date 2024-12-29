const Estilo = new Object({
  enLinea: {
    seccion: {
      width: "99.85%",
      height: "62.7%",
      marginTop: "4%",

      tarjetasDestacadas: {
        width: "100%",
        height: "40%",

        listado: {
          display: "flex",
          flexFlow: "row nowrap",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: "100%",
          padding: "0",
          margin: "0",
          listStyleType: "none",

          tarjetas: {
            backgroundColor: "white",
            width: "20%",
            height: "100%",
            display: "flex",
            flexFlow: "column nowrap",
            justifyContent: "center",
            alignItems: "center",
            borderRadius:"20px"
          },
        },
      },
    },
  },
  clases: ["borde-x-defecto"],
});

export default Estilo;
