/* eslint-disable react/prop-types */
import Estilo from "@views/Main/Aplicaciones/Habilidades/Configuracion/Estilo"

function TarjetasContacto({ Conf, CustomStyle }) {
    let tarjetas = Conf
    return (<ul style={CustomStyle} >
        {tarjetas.map(tarjeta => {
            console.log({ tarjeta })
            return (<li key={tarjeta.id ?? 0} style={Estilo.enLinea.seccion.tarjetasContacto.tarjetas.tarjeta} >
                <img src={tarjeta.imagen} alt="img-prueba" />
                <h2>{tarjeta.titulo}</h2>
                <span>{tarjeta.descripcion}</span>
            </li>)
        })}</ul>)
}

export default TarjetasContacto;