import React from "react";
import { Switch, Route } from "react-router-dom";
import ProtectedRoute from "./Components/protectedroute";
import LandingPage from "./Components/pages/landingpage";
import Dashboard from "./Components/pages/dashboard";
import SettingsPage from "./Components/pages/settingspage";
import NavigationBar from "./Components/navigationbar";
import { Grid } from "@material-ui/core";
import ReminderPackagesPage from "./Components/pages/reminderpackagespage";
import Analytics from "./Components/pages/analytics";
const App = () => {
  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch" spacing={2}>
      <Grid item style={{ width: "100%" }}>
        <NavigationBar />
      </Grid>
      <Grid item style={{ width: "100%" }}>
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <ProtectedRoute path="/analytics" exact component={Analytics} />
          <ProtectedRoute path="/dashboard" exact component={Dashboard} />
          <ProtectedRoute path="/settings" exact component={SettingsPage} />
          <ProtectedRoute path="/reminderpackages" exact component={ReminderPackagesPage} />
        </Switch>
      </Grid>
    </Grid>
  );
};

export default App;
