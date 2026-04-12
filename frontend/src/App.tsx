import MatrixRain from "@utilities/Elementos/MatrixRain/MatrixRain";
import CursorPersonalizado from "@utilities/Elementos/CursorPersonalizado/CursorPersonalizado";
import Main from "./views/Main/Main";

function App() {
  return (
    <div className="app-root">
      <CursorPersonalizado />
      <MatrixRain />
      <div className="app-root__chrome">
        <Main />
      </div>
    </div>
  );
}

export default App;
