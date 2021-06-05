import React from "react";
import { Switch, Route } from "react-router-dom";
import ProtectedRoute from "./Components/protectedroute";
import LandingPage from "./Components/pages/landingpage";
import Dashboard from "./Components/pages/dashboard";
import SettingsPage from "./Components/pages/settingspage";

const App = () => {
  return (
    <Switch>
      <Route path="/" exact component={LandingPage} />
      <ProtectedRoute path="/dashboard" exact component={Dashboard} />
      <ProtectedRoute path="/settings" exact component={SettingsPage} />
    </Switch>
  );
};

export default App;
