import "../../assets/layout/NavBar.css";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}

export default NavBar;
