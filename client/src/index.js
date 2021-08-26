import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ThemeProvider } from '@material-ui/core/styles';
import { darkTheme, lightTheme } from '../src/utils/theme';

const muiTheme = lightTheme;


ReactDOM.render(
  <React.StrictMode>
          <ThemeProvider theme={muiTheme}>

    <App />
    </ThemeProvider>

  </React.StrictMode>,
  document.getElementById("root")
);
