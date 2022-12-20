import { Outlet, Link } from "react-router-dom";
import React from "react";
import '../Styles/Layout.css'

const Layout = () => {
  return (
    <>
      <nav className="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/toptracks">TopTracks</Link>
          </li>
          <li>
            <Link to="/topartists">TopArtists</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;