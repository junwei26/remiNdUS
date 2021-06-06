import React from "react";
import { Switch, Route } from "react-router-dom";
import ProtectedRoute from "./Components/protectedroute";
import LandingPage from "./Components/pages/landingpage";
import Dashboard from "./Components/pages/dashboard";
import SettingsPage from "./Components/pages/settingspage";
import NavigationBar from "./Components/navigationbar";
import { Grid } from "@material-ui/core";

const App = () => {
  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch" spacing={2}>
      <Grid item>
        <NavigationBar />
      </Grid>
      <Grid item>
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <ProtectedRoute path="/dashboard" exact component={Dashboard} />
          <ProtectedRoute path="/settings" exact component={SettingsPage} />
        </Switch>
      </Grid>
    </Grid>
  );
};

export default App;
