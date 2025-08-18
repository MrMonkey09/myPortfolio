import Encabezado from "@utilities/Elementos/Encabezado/Encabezado.jsx";
import Configuracion from "./Configuracion";
import Estilo from "./Estilo";
import FormularioContacto from "@utilities/Elementos/Formularios/FormularioContacto";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";

function Contacto() {
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <div style={Estilo.enLinea.contenedorFormulario}>
        <h1>Envíame un mensaje 🤖</h1>
        <FormularioContacto Conf={Configuracion.contenido.formulario} />
      </div>
      <div>
        <h1>Mis datos de contacto</h1>
        <TarjetasDestacadas
          Conf={[
            {
              id: "1",
              titulo: "Soy mejor que todos",
              descripcion: "Cómeme los huevos malnacido",
              imagen: "/src/assets/images/img-prueba.svg",
            },
          ]}
          CustomStyle={{}}
        />
      </div>
    </>
  );
}

export default Contacto;
