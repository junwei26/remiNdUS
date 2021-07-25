import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Typography,
  TextField,
  Paper,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  ListItem,
  ListItemText,
  Snackbar,
} from "@material-ui/core";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import PropTypes from "prop-types";
import activityService from "../../services/activityService";
import userService from "../../services/userService";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
    padding: "20px",
  },
  paper: {
    height: "750px",
  },
  gridItem: {
    width: "90%",
  },
  dataGridActivities: {
    width: "100%",
    height: "480px",
  },
}));

const RetrieveActivities = (props) => {
  const classes = useStyles();

  const [modsLink, setModsLink] = useState("");
  const [modsList, setModsList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [selectionModelModules, setSelectionModelModules] = useState([]);
  const currentDate = new Date();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const [acadYear, setAcadYear] = useState(
    currentDate.getMonth() <= 7
      ? `${currentDate.getFullYear() - 1}-${currentDate.getFullYear()}`
      : `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`
  );
  const [semester, setSemester] = useState(1);
  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };
  const dateMap = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };
  const dateReverseMap = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const loadingActivityList = [
    {
      id: 1,
      name: "Loading...",
      description: "Loading...",
      activityTag: "Loading...",
      startDateAndTime: "Loading...",
      endDateAndTime: "Loading...",
      frequency: "Loading...",
      activityType: "Loading...",
    },
  ];

  const activityColumns = [
    {
      field: "name",
      headerName: "Name",
      flex: 0.9,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.2,
    },
    {
      field: "activityTag",
      headerName: "Tag",
      flex: 0.7,
    },
    {
      field: "startDateAndTime",
      headerName: "Start Date/Time",
      flex: 1,
      valueFormatter: (params) => {
        const startTime = params.row.startTime;
        if (!startTime) {
          return "";
        } else {
          return `${startTime.slice(0, 2)}:${startTime.slice(2, 4)}`;
        }
      },
    },
    {
      field: "endDateAndTime",
      headerName: "End Date/Time",
      flex: 1,
      valueFormatter: (params) => {
        if (params.value === "Loading...") {
          return "Loading...";
        }
        const endTime = params.row.endTime;
        if (!endTime) {
          return "";
        } else {
          return `${endTime.slice(0, 2)}:${endTime.slice(2, 4)}`;
        }
      },
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0.7,
      valueFormatter: (params) => {
        if (params.value === "Loading...") {
          return "Loading...";
        }
        return params.getValue(params.id, "frequency") === "weekly"
          ? dateReverseMap[params.value - 1]
          : params.value;
      },
    },
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1,
    },
  ];

  const parseLink = () => {
    let tempMods = [];
    const modsString = modsLink.split("?");
    if (modsString.length === 2) {
      tempMods = modsString[1].split("&");
      tempMods = tempMods.map((modString, index) => {
        const lecture = modString.includes("LEC")
          ? modString.substr(modString.search("LEC") + 4).split(",")[0]
          : "";
        const tutorial = modString.includes("TUT")
          ? modString.substr(modString.search("TUT") + 4).split(",")[0]
          : "";
        const recitation = modString.includes("REC")
          ? modString.substr(modString.search("REC") + 4).split(",")[0]
          : "";
        const sectional = modString.includes("SEC")
          ? modString.substr(modString.search("SEC") + 4).split(",")[0]
          : "";
        const laboratory = modString.includes("LAB")
          ? modString.substr(modString.search("LAB") + 4).split(",")[0]
          : "";
        return {
          id: index,
          name: modString.split("=")[0],
          lec: lecture,
          tut: tutorial,
          rec: recitation,
          sec: sectional,
          lab: laboratory,
        };
      });
    }

    setModsList(tempMods);
    return tempMods;
  };

  const parseModuleDetails = (moduleDetails, modsList) => {
    const moduleTimetables = moduleDetails.map((moduleData) => {
      if (!moduleData) {
        return {};
      }
      const singleSemesterData = moduleData.semesterData.filter(
        (semesterData) => semesterData.semester == semester
      );
      if (singleSemesterData.length === 0) {
        return {};
      }
      return {
        moduleCode: moduleData.moduleCode,
        description: moduleData.title,
        timetable: singleSemesterData[0].timetable,
      };
    });

    let tempActivityList = [];

    for (let i = 0; i < modsList.length; ++i) {
      const mod = modsList[i];
      const modDetails = moduleTimetables[i];

      if (!modDetails.timetable) {
        continue;
      }

      const timetable = modDetails.timetable;
      const lectures = timetable
        .filter((lesson) => lesson.lessonType == "Lecture" && lesson.classNo == mod.lec)
        .map((lesson) => {
          return {
            name: lesson.lessonType,
            description: modDetails.description,
            activityTag: modDetails.moduleCode,
            frequency: "weekly",
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            date: dateMap[lesson.day],
          };
        });
      const tutorial = timetable
        .filter((lesson) => lesson.lessonType == "Tutorial" && lesson.classNo == mod.tut)
        .map((lesson) => {
          return {
            name: lesson.lessonType,
            description: modDetails.description,
            activityTag: modDetails.moduleCode,
            frequency: "weekly",
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            date: dateMap[lesson.day],
          };
        });
      const recitation = timetable
        .filter((lesson) => lesson.lessonType == "Recitation" && lesson.classNo == mod.rec)
        .map((lesson) => {
          return {
            name: lesson.lessonType,
            description: modDetails.description,
            activityTag: modDetails.moduleCode,
            frequency: "weekly",
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            date: dateMap[lesson.day],
          };
        });
      const sectional = timetable
        .filter((lesson) => lesson.lessonType == "Sectional Teaching" && lesson.classNo == mod.sec)
        .map((lesson) => {
          return {
            name: lesson.lessonType,
            description: modDetails.description,
            activityTag: modDetails.moduleCode,
            frequency: "weekly",
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            date: dateMap[lesson.day],
          };
        });
      const laboratory = timetable
        .filter((lesson) => lesson.lessonType == "Laboratory" && lesson.classNo == mod.lab)
        .map((lesson) => {
          return {
            name: lesson.lessonType,
            description: modDetails.description,
            activityTag: modDetails.moduleCode,
            frequency: "weekly",
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            date: dateMap[lesson.day],
          };
        });

      tempActivityList.push(
        lectures.concat(tutorial).concat(recitation).concat(sectional).concat(laboratory)
      );
    }

    tempActivityList = [].concat.apply([], tempActivityList);
    const activityList = tempActivityList.map((activity, index) => {
      return { ...activity, id: index };
    });

    return activityList;
  };

  const handleRetrieveActivities = (e) => {
    e.preventDefault();
    setActivityList(loadingActivityList);
    const modsList = parseLink();

    activityService
      .getNusmodsModules(
        modsList.map((mod) => mod.name),
        acadYear
      )
      .then((moduleDetails) => {
        setActivityList(parseModuleDetails(moduleDetails, modsList));
      })
      .catch((error) => {
        if (error.response) {
          setCurrentAlert({
            severity: "error",
            message: `Error getting activities from NUSMODS. Error status code: ${error.response.status}. ${error.response.data.message}`,
          });
          setSnackbarOpen(true);
        } else {
          setCurrentAlert({
            severity: "error",
            message: `Error getting activities from NUSMODS. ${error}`,
          });
          setSnackbarOpen(true);
        }
      });
  };

  const acadYearMenuItems = [-3, -2, -1, 0, 1, 2, 3, 4, 5].map((diff) => {
    const acadYear =
      currentDate.getMonth() <= 7
        ? `${currentDate.getFullYear() - 1 + diff}-${currentDate.getFullYear() + diff}`
        : `${currentDate.getFullYear() + diff}-${currentDate.getFullYear() + 1 + diff}`;
    return (
      <MenuItem value={acadYear} key={acadYear}>
        {"Acad year: " + acadYear}
      </MenuItem>
    );
  });

  const handleChangeAcadYear = (e) => {
    setAcadYear(e.target.value);
  };

  const handleModsLinkChange = (e) => {
    setModsLink(e.target.value);
  };

  const handleChangeSemester = (e) => {
    setSemester(e.target.value);
  };

  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const handleDataGridSelectionChange = (e) => {
    const selectedIDs = new Set(e.selectionModel);
    setSelectedRows(activityList.filter((row) => selectedIDs.has(row.id)));
  };

  const updateSearchText = (e) => {
    setSearchText(e.target.value);
  };

  const handleAddActivities = (e) => {
    e.preventDefault();

    const accountForDuplicatedTemplates = (activities) => {
      for (let i = 1; i < activities.length; ++i) {
        let j = i - 1;
        while (activities[j].templateActivityId === "previous") {
          --j;
        }

        if (
          activities[i].name === activities[j].name &&
          activities[i].description === activities[j].description &&
          activities[i].activityTag === activities[j].activityTag
        ) {
          activities[i] = {
            templateActivityId: "previous",
            frequency: activities[i].frequency,
            startTime: activities[i].startTime,
            endTime: activities[i].endTime,
            date: activities[i].date,
          };
        }
      }

      const newActivities = [];
      let tempActivities = [];
      for (let i = 0; i < activities.length; ++i) {
        if (activities[i].templateActivityId !== "previous") {
          if (tempActivities.length !== 0) {
            newActivities.push(tempActivities);
          }
          tempActivities = [];
          tempActivities.push(activities[i]);
        } else {
          tempActivities.push(activities[i]);
          if (i === activities.length - 1) {
            newActivities.push(tempActivities);
          }
        }
      }

      return newActivities;
    };

    const activityTags = modsList.map((mod) => mod.name);

    return userService
      .addTag(activityTags)
      .then(() => {
        return activityService
          .addActivities(accountForDuplicatedTemplates(selectedRows))
          .then(() => {
            setCurrentAlert({
              severity: "success",
              message: "Successfully added activities from NUSMODS",
            });
            setSnackbarOpen(true);
            props.setPlannerDataUpdate(!props.plannerDataUpdate);
            clearAllFields();
          })
          .catch((error) => {
            setCurrentAlert({
              severity: "error",
              message: `Issue adding activities. Error status code: ${error.response.status}. ${error.response.data.message}`,
            });
            setSnackbarOpen(true);
          });
      })
      .catch((error) => {
        if (error.response) {
          setCurrentAlert({
            severity: "error",
            message: `Error creating activity tag. Error status code: ${error.response.status}. ${error.response.data.message}`,
          });
          setSnackbarOpen(true);
        } else {
          setCurrentAlert({
            severity: "error",
            message: `Error getting activities from NUSMODS. ${error}`,
          });
          setSnackbarOpen(true);
        }
      });
  };

  const clearAllFields = () => {
    setModsLink("");
    setModsList([]);
    setActivityList([]);
    setAcadYear(
      currentDate.getMonth() <= 7
        ? `${currentDate.getFullYear() - 1}-${currentDate.getFullYear()}`
        : `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`
    );
    setSemester(1);
    clearSelectionModelModules();
  };

  const clearSelectionModelModules = () => {
    setSelectionModelModules([]);
  };
  return (
    <>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
      <ListItem button key="Retrieve from NUSMODS">
        <ListItemText primary="Retrieve from NUSMODS" onClick={handleDialogClickOpen} />
      </ListItem>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">Retrieve Activities</DialogTitle>
        <DialogContent>
          <Paper elevation={2} variant="outlined" className={classes.paper}>
            <form
              noValidate
              autoComplete="off"
              onSubmit={handleRetrieveActivities}
              style={{ width: "100%", height: "100%" }}
            >
              <Grid
                container
                className={classes.root}
                direction="column"
                justify="flex-start"
                alignItems="center"
                spacing={2}
              >
                <Grid item className={classes.gridItem}>
                  <TextField
                    label="Enter NUSMODS link. E.g. 'https://nusmods.com/timetable/sem-1/share?CS1101S=TUT:09E,REC:07A,LEC:1'"
                    value={modsLink}
                    onChange={handleModsLinkChange}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid
                  container
                  item
                  className={classes.gridItem}
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item>
                    <Select value={acadYear} onChange={handleChangeAcadYear}>
                      {acadYearMenuItems}
                    </Select>
                  </Grid>
                  <Grid item>
                    <Select value={semester} onChange={handleChangeSemester}>
                      <MenuItem value={1}>Semester: 1</MenuItem>
                      <MenuItem value={2}>Semester: 2</MenuItem>
                    </Select>
                  </Grid>
                  <Grid item></Grid>
                  <Grid item>
                    <Button type="submit" color="primary">
                      Get Activities
                    </Button>
                  </Grid>
                </Grid>
                <Grid item className={classes.gridItem}>
                  <TextField
                    label="Search Activities (by name)"
                    type="search"
                    value={searchText}
                    onChange={updateSearchText}
                    fullWidth
                    autoFocus
                  />
                </Grid>
                <Grid item className={classes.gridItem}>
                  <Typography>Retrieved Activities</Typography>
                  <DataGrid
                    className={classes.dataGridActivities}
                    rows={activityList}
                    columns={activityColumns}
                    autoPageSize
                    checkboxSelection
                    filterModel={{
                      items: [
                        { columnField: "name", operatorValue: "contains", value: searchText },
                      ],
                    }}
                    onSelectionModelChange={handleDataGridSelectionChange}
                    selectionModel={selectionModelModules}
                    style={{ overflowX: "auto" }}
                    components={{ Toolbar: GridToolbar }}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained" color="primary">
            Close
          </Button>
          <Button onClick={handleAddActivities} variant="contained" color="primary">
            Add selected activities
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

RetrieveActivities.propTypes = {
  plannerDataUpdate: PropTypes.bool,
  setPlannerDataUpdate: PropTypes.func,
};

export default RetrieveActivities;
