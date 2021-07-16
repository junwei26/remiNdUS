import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import reminderService from "../../services/reminderService";
import localService from "../../services/localService";
import RefreshIcon from "@material-ui/icons/Refresh";
import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from "@material-ui/icons/Delete";
import EditReminderDisplay from "./editreminderdisplay";

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
    height: "450px",
  },
}));

const SearchReminders = () => {
  const reminderColumns = [
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
      field: "frequency",
      headerName: "Frequency",
      flex: 1.0,
    },
    {
      field: "reminderType",
      headerName: "Reminder Type",
      flex: 1.1,
    },
    {
      field: "subscribed",
      headerName: "Subscribed",
      flex: 1,
    },
  ];

  const loadingReminderList = [
    {
      id: 1,
      name: "Loading...",
      description: "Loading...",
      packageTag: "Loading...",
      ownerName: "Loading...",
      public: "Loading...",
      verified: "Loading...",
      lastModified: "Loading...",
      numberOfReminders: "Loading...",
    },
  ];

  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reminderList, setReminderList] = useState(loadingReminderList);
  const [editingReminder, setEditingReminder] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogMaxWidth, setDialogMaxWidth] = useState("lg");

  const handleDialogClickOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDataGridSelectionChange = (e) => {
    const selectedIDs = new Set(e.selectionModel);
    setSelectedRow(reminderList.filter((row) => selectedIDs.has(row.id))[0]);
  };

  const clearSelectionModel = () => {
    setSelectionModel([]);
  };

  const clearAllFields = () => {
    setSearchText("");
    clearSelectionModel();
  };

  const updateSearchText = (e) => {
    setSearchText(e.target.value);
  };

  const getAllReminders = () => {
    let tempReminderList = [];
    reminderService
      .getAllReminders()
      .then((response) => {
        tempReminderList = response.data;

        for (let i = 0; i < tempReminderList.length; ++i) {
          tempReminderList[i].id = i + 1;
        }
        setReminderList(tempReminderList);
      })
      .catch((error) => {
        alert(
          `Issue getting reminders. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  const refreshReminders = () => {
    clearAllFields();
    setSelectedRow(null);
    setReminderList(loadingReminderList);
    getAllReminders();
  };

  useEffect(() => {
    getAllReminders();
  }, []);

  const handleEditReminders = () => {
    if (!selectedRow) {
      alert("Please select an reminder to edit");
      return;
    } else {
      setDialogMaxWidth("xs");
      setEditingReminder(true);
      clearAllFields();
    }
  };

  const handleDeleteReminder = () => {
    if (!selectedRow) {
      alert("Please select an reminder to delete");
      return;
    } else if (selectedRow.subscribed === true) {
      alert(
        "You cannot delete a reminder from a reminder package that you are subscribed. Please unsubscribe from the respective reminder package instead."
      );
      return;
    } else {
      reminderService
        .deleteReminder(
          selectedRow.reminderId,
          selectedRow.reminderType === "planned" ? "plannedReminders" : "recurringReminders"
        )
        .then(() => {
          alert("Successfully deleted reminder");
        })
        .catch((error) => {
          alert(
            `Issue deleting reminder. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
        });
    }
  };

  return (
    <>
      <ListItem button onClick={handleDialogClickOpen} key="Search Reminder">
        <ListItemText primary="Search Reminder" />
      </ListItem>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth={dialogMaxWidth}
      >
        <DialogTitle id="form-dialog-title">
          {editingReminder ? "Edit Reminder" : "Search Reminders"}
        </DialogTitle>
        {editingReminder ? (
          <EditReminderDisplay
            reminder={selectedRow}
            setEditingReminder={setEditingReminder}
            setDialogMaxWidth={setDialogMaxWidth}
            setSelectedRow={setSelectedRow}
          />
        ) : (
          <>
            <DialogContent>
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
                    label="Search Packages (by name)"
                    type="search"
                    value={searchText}
                    onChange={updateSearchText}
                    fullWidth
                    autoFocus
                  />
                </Grid>
                <Grid item className={classes.gridItem} />
                <Grid item className={classes.gridItem}>
                  <Typography>List of reminders</Typography>
                </Grid>
                <Grid item className={classes.dataGrid}>
                  <DataGrid
                    rows={reminderList}
                    columns={reminderColumns}
                    autoPageSize
                    filterModel={{
                      items: [
                        { columnField: "name", operatorValue: "contains", value: searchText },
                      ],
                    }}
                    onSelectionModelChange={handleDataGridSelectionChange}
                    selectionModel={selectionModel}
                    style={{ overflowX: "auto" }}
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
                  <Grid item>
                    <Tooltip title="Refresh" aria-label="refresh">
                      <IconButton onClick={refreshReminders} variant="contained" color="primary">
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
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
                      <Tooltip title="Delete" aria-label="delete">
                        <IconButton
                          onClick={handleDeleteReminder}
                          variant="contained"
                          color="primary"
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Edit" aria-label="edit">
                        <IconButton
                          onClick={handleEditReminders}
                          variant="contained"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Grid container direction="row" justify="center" alignItems="center">
                <Grid item style={{ width: "20%" }}>
                  <Button onClick={handleDialogClose} color="primary" fullWidth>
                    Close
                  </Button>
                </Grid>
              </Grid>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default SearchReminders;
