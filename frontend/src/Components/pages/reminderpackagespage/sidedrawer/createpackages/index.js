import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, Paper, Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import reminderService from "../../../services/reminderService";
import reminderPackageService from "../../../services/reminderPackageService";
import localService from "../../../services/localService";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
    padding: "20px",
  },
  gridItem: {
    width: "90%",
  },
  dataGrid: {
    width: "90%",
    height: "410px",
  },
}));

const SubscribedPackages = () => {
  const classes = useStyles();

  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [packageTag, setPackageTag] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchRemindersText, setSearchRemindersText] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const loadingReminderList = [
    {
      id: 1,
      name: "Loading...",
      description: "Loading...",
      endTime: "Loading...",
      endDateTime: "Loading...",
      defaultLength: "Loading...",
      reminderType: "Loading...",
      date: "Loading...",
      frequency: "Loading...",
      active: "Loading...",
    },
  ];
  const [reminderList, setReminderList] = useState(loadingReminderList);

  const reminderColumns = [
    {
      field: "name",
      headerName: "Name",
      flex: 0.7,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "endDateAndTime",
      headerName: "End Date/Time",
      flex: 1,
      valueGetter: (params) => {
        return params.getValue(params.id, "reminderType") === "recurring"
          ? `${params.getValue(params.id, "endTime").slice(0, 2)}:${params
              .getValue(params.id, "endTime")
              .slice(2, 4)}`
          : localService.parseTimeToString(params.getValue(params.id, "endDateTime"));
      },
      sortComparator: (v1, v2) => {
        if (v1.length < v2) {
          return -1;
        } else if (v1.length > v2) {
          return 1;
        } else {
          return parseInt(v1) > parseInt(v2);
        }
      },
    },
    {
      field: "reminderType",
      headerName: "Reminder Type",
      flex: 1.3,
      valueFormatter: (params) => {
        return `${
          String(params.value).charAt(0).toUpperCase() + String(params.value).substring(1)
        }`;
      },
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0.7,
      hide: true,
    },
    {
      field: "frequency",
      headerName: "Frequency",
      flex: 1,
      hide: true,
    },
    {
      field: "active",
      headerName: "Active",
      flex: 1,
      hide: true,
    },
  ];

  const updatePackageName = (e) => {
    setPackageName(e.target.value);
  };

  const updateDescription = (e) => {
    setDescription(e.target.value);
  };

  const updatePackageTag = (e) => {
    setPackageTag(e.target.value);
  };

  const updateSearchRemindersText = (e) => {
    setSearchRemindersText(e.target.value);
  };

  const clearSelectionModel = () => {
    setSelectionModel([]);
  };

  const clearAllFields = () => {
    setPackageName("");
    setDescription("");
    setPackageTag("");
    setSearchRemindersText("");
    clearSelectionModel();
  };

  const refreshPackages = () => {
    clearAllFields();
    setReminderList(loadingReminderList);
    getReminders();
  };

  const handleSubmitCreatePackage = (e) => {
    e.preventDefault();

    const plannedReminderIds = [];
    const recurringReminderIds = [];

    for (let i = 0; i < selectedRows.length; ++i) {
      if (selectedRows[i].reminderType === "planned") {
        plannedReminderIds.push(selectedRows[i].reminderId);
      } else {
        recurringReminderIds.push(selectedRows[i].reminderId);
      }
    }

    reminderPackageService
      .addReminderPackage(packageName, description, packageTag, {
        plannedReminderIds,
        recurringReminderIds,
      })
      .then(() => {
        alert("Successfully created reminder package!");
        clearAllFields();
      })
      .catch((error) => {
        alert(
          `Issue creating new reminder package. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  const handleDataGridSelectionChange = (e) => {
    const selectedIDs = new Set(e.selectionModel);
    setSelectedRows(reminderList.filter((row) => selectedIDs.has(row.id)));
  };

  const getReminders = () => {
    let tempReminderList = [];
    reminderService
      .getAllLocalReminders()
      .then((response) => {
        tempReminderList = response.data;
        for (let i = 0; i < tempReminderList.length; ++i) {
          tempReminderList[i].id = i + 1;
        }
        setReminderList(tempReminderList);
      })
      .catch((error) => {
        alert(
          `Issue getting reminder packages. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  useEffect(() => {
    getReminders();
  }, []);

  return (
    <>
      <Typography>Create Reminder Packages</Typography>
      <Paper elevation={2} variant="outlined" style={{ height: "780px" }}>
        <form
          noValidate
          autoComplete="off"
          onSubmit={handleSubmitCreatePackage}
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
                label="Package Name"
                value={packageName}
                onChange={updatePackageName}
                required
                fullWidth
              />
            </Grid>

            <Grid item className={classes.gridItem}>
              <TextField
                label="Description"
                value={description}
                onChange={updateDescription}
                required
                fullWidth
              />
            </Grid>

            <Grid item className={classes.gridItem}>
              <TextField
                label="Package Tag (Optional)"
                value={packageTag}
                onChange={updatePackageTag}
                fullWidth
              />
            </Grid>
            <Grid item className={classes.gridItem} />

            <Grid
              container
              item
              className={classes.gridItem}
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid
                container
                item
                xs={3}
                style={{ height: "100%" }}
                justify="flex-start"
                alignItems="flex-end"
              >
                <Grid item style={{ width: "100%" }}>
                  <Typography>Reminders/Deadlines</Typography>
                </Grid>
              </Grid>
              <Grid item xs={9}>
                <TextField
                  label="Search Reminders (by name)"
                  type="search"
                  value={searchRemindersText}
                  onChange={updateSearchRemindersText}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid item className={classes.dataGrid}>
              <DataGrid
                rows={reminderList}
                columns={reminderColumns}
                autoPageSize
                checkboxSelection
                filterModel={{
                  items: [
                    { columnField: "name", operatorValue: "contains", value: searchRemindersText },
                  ],
                }}
                onSelectionModelChange={handleDataGridSelectionChange}
                selectionModel={selectionModel}
              />
            </Grid>
            <Grid
              container
              item
              className={classes.gridItem}
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid
                container
                item
                direction="row"
                justify="center"
                alignItems="center"
                style={{ width: "auto", height: "100%" }}
                spacing={2}
              >
                <Grid item>
                  <Button onClick={clearAllFields} variant="contained" color="primary">
                    Clear
                  </Button>
                </Grid>
                <Grid item>
                  <Button onClick={refreshPackages} variant="contained" color="primary">
                    Refresh
                  </Button>
                </Grid>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary">
                  Create
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

export default SubscribedPackages;
