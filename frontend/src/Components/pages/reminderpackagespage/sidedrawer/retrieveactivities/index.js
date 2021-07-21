import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
// import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, Paper, Button, Select, MenuItem } from "@material-ui/core";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
// Tooltip, IconButton
import activityService from "../../../services/activityService";
import userService from "../../../services/userService";
const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
    padding: "20px",
  },
  paper: {
    height: "1180px",
  },
  gridItem: {
    width: "90%",
  },
  dataGridModules: {
    width: "100%",
    height: "280px",
  },
  dataGridActivities: {
    width: "100%",
    height: "520px",
  },
}));

const RetrieveActivities = () => {
  const classes = useStyles();

  const [modsLink, setModsLink] = useState("");
  const [modsList, setModsList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [selectionModelModules, setSelectionModelModules] = useState([]);
  const currentDate = new Date();
  const [acadYear, setAcadYear] = useState(
    currentDate.getMonth() <= 7
      ? `${currentDate.getFullYear() - 1}-${currentDate.getFullYear()}`
      : `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`
  );
  const [semester, setSemester] = useState(1);
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

  const modColumns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "lec",
      headerName: "Lecture",
      flex: 1,
    },
    {
      field: "tut",
      headerName: "Tutorial",
      flex: 1,
    },
    {
      field: "rec",
      headerName: "Recitation",
      flex: 1,
    },
    {
      field: "sec",
      headerName: "Sectional",
      flex: 1,
    },
    {
      field: "lab",
      headerName: "Laboratory",
      flex: 1,
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
          alert(
            `Error getting activities from NUSMODS. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
        } else {
          alert(`Error getting activities from NUSMODS. ${error}`);
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

  const handleCheckModules = () => {
    parseLink();
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
            alert("Successfully added activities from NUSMODS");
            clearAllFields();
          })
          .catch((error) => {
            alert(
              `Issue adding activities. Error status code: ${error.response.status}. ${error.response.data.message}`
            );
          });
      })
      .catch((error) => {
        if (error.response) {
          alert(
            `Error creating activity tag. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
        } else {
          alert(`Error getting activities from NUSMODS. ${error}`);
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
      <Typography>Retrieve activities from NUSMODS</Typography>
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
                label="Enter NUSMODS link"
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
              <Grid item>
                <Button onClick={handleCheckModules} color="primary">
                  Check Modules
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" color="primary">
                  Get Activities
                </Button>
              </Grid>
            </Grid>
            <Grid item className={classes.gridItem}>
              <Typography>Detected Modules</Typography>
              <DataGrid
                className={classes.dataGridModules}
                rows={modsList}
                columns={modColumns}
                autoPageSize
              />
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
                  items: [{ columnField: "name", operatorValue: "contains", value: searchText }],
                }}
                onSelectionModelChange={handleDataGridSelectionChange}
                selectionModel={selectionModelModules}
                style={{ overflowX: "auto" }}
                components={{ Toolbar: GridToolbar }}
              />
            </Grid>
            <Grid item>
              <Button onClick={handleAddActivities} variant="contained" color="primary">
                Add selected activities
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

export default RetrieveActivities;
