/* eslint-disable react/prop-types */
import Estilo from "@views/Main/Aplicaciones/Habilidades/Configuracion/Estilo"
const estilo = Estilo.enLinea.seccion.tecnologias.tecnologia

function TarjetasIncrustadas({ Conf, CustomStyle }) {
    let tarjetas = Conf
    return (<ul style={CustomStyle}>
        {tarjetas.map(tarjeta => {
            console.log({ tarjeta })
            return (<li key={tarjeta.id ?? 0} style={estilo} >
                <div style={estilo.contenedorImagen}>
                    <img style={estilo.contenedorImagen.imagen} src={tarjeta.imagen} alt="habilidad-img" />
                </div>
                <div style={estilo.contenedorTexto}>
                    <h3 style={estilo.contenedorTexto.titulo}>{tarjeta.titulo}</h3>
                    <span style={estilo.contenedorTexto.descripcion}>{tarjeta.descripcion}</span>
                </div>
            </li>)
        })}</ul>)
}

export default TarjetasIncrustadas;