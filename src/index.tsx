import ReactDOM from "react-dom/client";
import { Routes } from "./routes";
import React from "react";
import "./app/globals.css";
import Providers from "./provider/providers";
import "dotenv/config";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import * as Sentry from "@sentry/react";

const sentryDSN =
  "https://349cdb274f74fce3416f3286731ee01d@o1323226.ingest.us.sentry.io/4508506829881344";
const envMode = import.meta.env.VITE_APP_SOLANA_ENV;

if (envMode === "mainnet-beta") {
  Sentry.init({
    environment: import.meta.env.VITE_APP_SENTRY_ENVIRONMENT,
    dsn: sentryDSN,
    denyUrls: [
      /extensions\//i,
      /extension/i,
      /vendor/i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
    ],
    ignoreErrors: [
      "Request rejected",
      "Failed to fetch",
      "Load failed",
      "User rejected the request",
      "Network Error",
      "Object captured as promise rejection",
      "Failed to execute 'insertBefore' on 'Node'",
    ],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1,
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <Header></Header>
      <div className="m-auto w-screen max-w-[1216px] px-4 sm:px-0">
        <Routes />
      </div>
      <Footer></Footer>
    </Providers>
  </React.StrictMode>
);
