import * as React from "react";
import Paper from "@material-ui/core/Paper";
import {
  Scheduler,
  WeekView,
  Appointments,
  AppointmentTooltip,
} from "@devexpress/dx-react-scheduler-material-ui";

import appointments from "./demo-data/today-appointments.js";

const WeeklyView = () => (
  <Paper>
    <Scheduler data={appointments} height={660}>
      <WeekView startDayHour={9} endDayHour={19} />
      <Appointments />
      <AppointmentTooltip showDeleteButton />
    </Scheduler>
  </Paper>
);

export default WeeklyView;
