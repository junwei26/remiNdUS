import React from "react";
import PropTypes from "prop-types";
import { TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const classes = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
}));

const LogInComponent = (props) => {
  // const [email, setEmail] = useState("Example@domain.com");
  // const [password, setPassword] = useState("password");

  return (
    <form className={classes.root} noValidate autoComplete="off" onSubmit={props.onSubmit}>
      <div>
        <TextField
          required
          id="filled-required"
          name="email"
          label="Email"
          defaultValue="test@domain.com"
          variant="filled"
          // onChange={setEmail}
        />
      </div>
      <div>
        <TextField
          id="filled-password-input"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          variant="filled"
          // onChange={setPassword}
        />
      </div>
      <div>
        <Button variant="contained" color="primary" type="submit">
          Log In
        </Button>
      </div>
    </form>
  );
};

LogInComponent.propTypes = {
  onSubmit: PropTypes.func,
};

export default LogInComponent;
