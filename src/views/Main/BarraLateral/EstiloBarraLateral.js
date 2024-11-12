 const EstiloBarraLatareal = new Object({
  estilos: {
    avatar: {
      width: "100%",
      height: "45%",
      display: "flex",
      flexFlow: "column nowrap",
      justifyContent: "center",
      alignItems: "center",
      borderBottom: "1px solid black",
    },
    menuApp: {
      width: "100%",
      height: "60%",
      display: "flex",
      flexFlow: "row wrap",
      justifyContent: "start",
      alignItems: "start",
      margin: "0",
      padding: "0",
      overflow: "auto",
      listStyleType: "none",
    },
    options: {
      width: "100%",
      height: "8%",
      display: "flex",
      flexFlow: "row nowrap",
      justifyContent:"center",
      gap:"0 17%",
      alignItems:"center",
      borderTop: "1px solid black",
    },
  },
  clases: ["borde-x-defecto"],
});

export default EstiloBarraLatareal;
