import Estilo from "./Estilo"
import TarjetasConf from "./Tarjetas.conf"

function Tarjetas() {
    let tarjetas = TarjetasConf
    return tarjetas.map(tarjeta => {
        console.log({ tarjeta })
        return (<li key={tarjeta.id ?? 0} style={Estilo.enLinea.seccion.tarjetasDestacadas.tarjetas.tarjeta} >
            <img src={tarjeta.imagen} alt="img-prueba" />
            <h2>ola</h2>
            <span>wena</span>
        </li>)
    })
}

export default Tarjetas;