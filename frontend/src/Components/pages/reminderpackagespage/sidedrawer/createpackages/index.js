import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, Paper, Button, Tooltip, IconButton } from "@material-ui/core";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import PropTypes from "prop-types";
import RefreshIcon from "@material-ui/icons/Refresh";
import AddBoxIcon from "@material-ui/icons/AddBox";
import EditIcon from "@material-ui/icons/Edit";
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
    height: "400px",
  },
}));

const CreatePackages = (props) => {
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
      endDateAndTime: "Loading...",
      defaultLength: "Loading...",
      reminderType: "Loading...",
      date: "Loading...",
      frequency: "Loading...",
      active: "Loading...",
    },
  ];
  const [reminderList, setReminderList] = useState(loadingReminderList);
  const [editingPackage, setEditingPackage] = useState(Boolean(props.reminderPackage));

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
        return params.value === "Loading..."
          ? params.value
          : params.getValue(params.id, "reminderType") === "recurring"
          ? `${params.getValue(params.id, "endTime").slice(0, 2)}:${params
              .getValue(params.id, "endTime")
              .slice(2, 4)}`
          : localService.parseTimeToString(params.getValue(params.id, "endDateTime"));
      },
      sortComparator: (v1, v2) => {
        if (v1.length > 5) {
          if (v2.length > 5) {
            const left = new Date(v1);
            const right = new Date(v2);

            return left.getTime() < right.getTime() ? -1 : left.getTime() > right.getTime() ? 1 : 0;
          }

          return 1;
        } else {
          if (v2.length > 5) {
            return -1;
          } else {
            return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
          }
        }
      },
    },
    {
      field: "reminderType",
      headerName: "Reminder Type",
      flex: 1,
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
    setEditingPackage(false);
    props.setSelectedReminderPackage(null);
  };

  const refreshPackages = () => {
    setSearchRemindersText("");
    if (editingPackage) {
      const selectedRowIds = reminderList
        .filter((reminder) => {
          if (reminder.reminderType === "planned") {
            return props.reminderPackage.plannedReminderIds.includes(reminder.reminderId);
          } else {
            return props.reminderPackage.recurringReminderIds.includes(reminder.reminderId);
          }
        })
        .map((reminder) => reminder.id);

      setSelectionModel(selectedRowIds);
    } else {
      clearSelectionModel();
    }
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

    if (editingPackage) {
      reminderPackageService
        .updateReminderPackage(
          props.reminderPackage.reminderPackageId,
          packageName,
          description,
          packageTag,
          {
            plannedReminderIds,
            recurringReminderIds,
          },
          props.reminderPackage.public
        )
        .then(() => {
          alert("Successfully updated reminder package!");
          props.setView("Subscribed Packages");
        })
        .catch((error) => {
          alert(
            `Issue updating reminder package. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
        });
    } else {
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
    }
  };

  const handleDataGridSelectionChange = (e) => {
    const selectedIDs = new Set(e.selectionModel);
    setSelectedRows(reminderList.filter((row) => selectedIDs.has(row.id)));
  };

  const getReminders = () => {
    let tempReminderList = [];
    return reminderService
      .getAllLocalReminders()
      .then((response) => {
        tempReminderList = response.data;
        for (let i = 0; i < tempReminderList.length; ++i) {
          tempReminderList[i].id = i + 1;
        }
        setReminderList(tempReminderList);
        return tempReminderList;
      })
      .catch((error) => {
        alert(
          `Issue getting reminder packages. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  useEffect(() => {
    getReminders().then((reminderList) => {
      if (editingPackage) {
        setPackageName(props.reminderPackage.name);
        setDescription(props.reminderPackage.description);
        setPackageTag(props.reminderPackage.packageTag);
        const selectedRowIds = reminderList
          .filter((reminder) => {
            if (reminder.reminderType === "planned") {
              return props.reminderPackage.plannedReminderIds.includes(reminder.reminderId);
            } else {
              return props.reminderPackage.recurringReminderIds.includes(reminder.reminderId);
            }
          })
          .map((reminder) => reminder.id);

        setSelectionModel(selectedRowIds);
      }
    });
  }, []);

  return (
    <>
      <Typography>
        {editingPackage ? "Edit Reminder Package" : "Create Reminder Packages"}
      </Typography>
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
                components={{ Toolbar: GridToolbar }}
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
                  <Tooltip title="Clear" aria-label="clear">
                    <Button onClick={clearAllFields} color="primary">
                      Clear
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Refresh" aria-label="refresh">
                    <IconButton onClick={refreshPackages} variant="contained" color="primary">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <Grid item>
                <Tooltip
                  title={editingPackage ? "Update" : "Create"}
                  aria-label={editingPackage ? "update" : "create"}
                >
                  <IconButton type="submit" variant="contained" color="primary">
                    {editingPackage ? <EditIcon /> : <AddBoxIcon />}
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

CreatePackages.propTypes = {
  reminderPackage: PropTypes.object,
  setSelectedReminderPackage: PropTypes.func,
  setView: PropTypes.func,
};

export default CreatePackages;
