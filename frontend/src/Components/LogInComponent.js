import React from "react";
import PropTypes from "prop-types";
import { TextField, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { signInWithEmailPassword } from "../firebaseAuth/email";

const classes = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
}));

const LogInComponent = () => {
  // const [email, setEmail] = useState("Example@domain.com");
  // const [password, setPassword] = useState("password");

  const handleSubmitLogIn = (e) => {
    e.preventDefault();
    signInWithEmailPassword(e.target.email.value, e.target.password.value);
  };

  return (
    <form className={classes.root} noValidate autoComplete="off" onSubmit={handleSubmitLogIn}>
      <div>
        <TextField
          required
          id="filled-required"
          name="email"
          label="Email"
          defaultValue="test@domain.com"
          variant="filled"
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
