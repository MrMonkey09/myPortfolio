const EstiloOpciones = new Object({
  estilos: {
    idioma: {
      contenedor: {
        height: "100%",
        width: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
      img: { borderRadius: "50%", height: "55%", width: "auto" },
      dropdown: {
        width: "auto",
        height: "40%",
        fill: "var(--color-fuente-secundaria)",
      },
    },
    magia: {
      width: "auto",
      height: "55%",
      fill: "var(--color-fuente-secundaria)",
    },
    tema: {
      width: "auto",
      height: "60%",
      fill: "#e8eaed",
    },
  },
  clases: ["borde-x-defecto"],
});

export default EstiloOpciones;
