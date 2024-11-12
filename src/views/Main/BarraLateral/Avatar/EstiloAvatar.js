const EstiloAvatar = new Object({
  estilos: {
    picture: {
      width: "100%",
      height: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",

      img: {
        width: "auto",
        height: "100%",
        borderRadius: "10%",
        filter:
          "drop-shadow(1px 1px 5px gray) drop-shadow(1px 1px 5px black) drop-shadow(1px 1px 5px gray)",
      },
    },
    h3: {
      width: "100%",
      height: "10%",
      textAlign: "center",
      fontSize: "1.6rem",
      display: "flex",
      flexFlow: "row nowrap",
      justifyContent: "center",
      alignItems: "center",
      gap: "9px",
      margin: "30px 0 10px 0",
      padding: "0",

      span: {
        color: "var(--color-fuente-secundaria)",
      },
    },
    span: {
      width: "100%",
      height: "5%",
      textAlign: "center",
      fontSize: "1.2rem",
      color: "var(--color-fuente-secundaria)",
    },
  },
  clases: ["borde-x-defecto"],
});

export default EstiloAvatar;
