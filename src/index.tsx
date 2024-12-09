import ReactDOM from 'react-dom/client';
import { Routes } from './routes';
import React from 'react';
import './app/globals.css';
import Providers from './provider/providers';
import 'dotenv/config';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <Header></Header>
      <div className="m-auto w-screen max-w-[1216px] px-2 sm:px-0">
        <Routes />
      </div>
      <Footer></Footer>
    </Providers>
  </React.StrictMode>
);
