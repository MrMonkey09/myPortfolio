const Estilo = new Object({
  enLinea: {
    educacionContainer: {
      
      timeLine: {
        listStyleType: "none", // Elimina los puntos de la lista
        position: "relative",
        paddingLeft: "20px", // Espacio para la línea del timeline

        

        timeLineItemContent: {
          position: "relative",
          backgroundColor: "red",
          color:"white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },
  },
  clases: ["borde-x-defecto"],
});

export default Estilo;
