import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './routes/home';
import About from './routes/about';
import Position from './routes/position';
import CreatePosition from './routes/createPosition';
import Error from './routes/error';

import Navbar from './components/navbar';
import Footer from './components/footer';

import {Amplify} from 'aws-amplify';
import awsconfig from './aws-exports'
import { withAuthenticator  } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactGA from "react-ga";
 
ReactGA.initialize("G-FLX3NVVBM8");
ReactGA.pageview(window.location.pathname + window.location.search);


Amplify.configure(awsconfig);

function App({ user }) {
  
  return (
    <BrowserRouter>
    <div style={{minHeight: '85vh'}}>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home  userdata={user}  />} />
      <Route path="/about" element={<About   />} />
      <Route path="/position/:id" element={<Position   userdata={user} />} />
      <Route path="/create_position" element={<CreatePosition />} />
      {/* error pages. */}
      <Route path="*" element={<Error   />} />
    </Routes>
    </div>
    <Footer />
    </BrowserRouter>
  );
}

export default withAuthenticator(App);
