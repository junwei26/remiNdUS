import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Carousel from "react-material-ui-carousel";
import DashboardImage from "./images/Dashboard.png";
import ReminderPackagesImage from "./images/ReminderPackages.png";
const useStyles = makeStyles(() => ({
  Card: {
    width: "50vw",
    height: "20vw",
    border: 0,
  },
  CardMedia: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: "contain",
  },
}));

const PlannerInfoCard = () => {
  const classes = useStyles();
  return (
    <Card className={classes.Card}>
      <CardContent>
        <Typography variant="body2" color="textSecondary" align="center">
          Timetable planning made easier! Automatically grab your lectures and tutorials through
          your NUSMods Timetable link.
        </Typography>
      </CardContent>
      <CardMedia
        className={classes.CardMedia}
        image={DashboardImage}
        component="img"
        title="dashboard"
      />
    </Card>
  );
};

const ReminderPackageInfoCard = () => {
  const classes = useStyles();
  return (
    <Card className={classes.Card}>
      <CardContent>
        <Typography variant="body2" color="textSecondary" align="center">
          Subscribe to reminder packages to automatically add module or CCA related reminders to
          your planner!
        </Typography>
      </CardContent>
      <CardMedia
        className={classes.CardMedia}
        image={ReminderPackagesImage}
        component="img"
        title="reminder package"
      />
    </Card>
  );
};

const LandingPageCarousel = () => {
  return (
    <Carousel timeout={300}>
      <PlannerInfoCard />
      <ReminderPackageInfoCard />
    </Carousel>
  );
};

export default LandingPageCarousel;
