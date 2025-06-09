import { Spinner } from "react-bootstrap";
import "./spinner.css";
const CustomSpinner = () => (
  <div className="spinner-container mainbg">
    <Spinner animation="grow" variant="warning" size="xl" className="spinner" />
    ;
  </div>
);

export default CustomSpinner;
