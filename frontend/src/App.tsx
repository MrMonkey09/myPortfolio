import MatrixRain from "@utilities/Elementos/MatrixRain/MatrixRain";
import Main from "./views/Main/Main";

function App() {
  return (
    <div className="app-root">
      <MatrixRain />
      <div className="app-root__chrome">
        <Main />
      </div>
    </div>
  );
}

export default App;
