import React from "react";
import { AppBar, Toolbar, Button, Grid } from "@material-ui/core";
import Popup from "reactjs-popup";
import AccountComponent from "../AccountComponent";

const LandingPage = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Grid container direction="row-reverse">
          <Grid item>
            <Popup trigger={<Button color="inherit">Login</Button>} modal>
              {(close) => (
                <Grid container direction="column">
                  <Grid container direction="row">
                    <Grid item xs={8}></Grid>
                    <Button onClick={close} xs={1}>
                      X
                    </Button>
                  </Grid>
                  <AccountComponent />
                </Grid>
              )}
            </Popup>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default LandingPage;
