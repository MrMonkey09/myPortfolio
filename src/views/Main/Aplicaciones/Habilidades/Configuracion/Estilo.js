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
            backgroundColor: "gray",
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

      tecnologias: {
        width: "97.5%",
        height: "auto",
        paddingLeft:"30px",

        titulo: {
          width: "99.85%",
          height: "10%",
          fontSize: "2em",
          color: "white",
        },

        lista: {
          display: "flex",
          flexFlow: "row wrap",
          justifyContent:"space-between",
          alignItems:"center",
        },

        tecnologia: {
          position: "relative",
          display: "flex",
          flexFlow: "row nowrap",
          width: "30%",
          gap: "0 15px",

          contenedorImagen: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            imagen: {
              width: "5rem",
              height: "5rem",
              padding:"5px",
              backgroundColor: "gray",
              borderRadius: "15px",
            },
          },

          contenedorTexto: {
            titulo: {},
            descripcion: {},
          },
        },
      },
    },
  },
  clases: ["borde-x-defecto"],
});

export default Estilo;
