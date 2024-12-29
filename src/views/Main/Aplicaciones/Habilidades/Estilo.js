const Estilo = new Object({
  enLinea: {
    seccion: {
      width: "99.85%",
      height: "62.7%",
      marginTop: "4%",

      tarjetasDestacadas: {
        width: "100%",
        height: "40%",

        tarjetas: {
          display: "flex",
          flexFlow: "column wrap",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          height: "100%",
          padding: "0",
          margin: "0",
          listStyleType: "none",
          overflowY: "hidden",
          overflowX: "auto",

          tarjeta: {
            backgroundColor: "white",
            width: "500px",
            height: "100%",
            display: "flex",
            flexFlow: "column nowrap",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "20px",
          },
        },
      },
    },
  },
  clases: ["borde-x-defecto"],
});

export default Estilo;
