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
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import activityService from "../../services/activityService";
import localService from "../../services/localService";
import RefreshIcon from "@material-ui/icons/Refresh";
import EditIcon from "@material-ui/icons/Edit";
import DeleteForeverIcon from "@material-ui/icons/Delete";
import EditActivityDisplay from "./editactivitydisplay";
import SearchIcon from "@material-ui/icons/Search";

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

const SearchActivities = (props) => {
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
      valueGetter: (params) => {
        return params.getValue(params.id, "activityType") === "recurring"
          ? `${params.getValue(params.id, "startTime").slice(0, 2)}:${params
              .getValue(params.id, "startTime")
              .slice(2, 4)}`
          : localService.parseTimeToString(params.getValue(params.id, "startDateTime"));
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
      field: "endDateAndTime",
      headerName: "End Date/Time",
      flex: 1,
      valueGetter: (params) => {
        return params.getValue(params.id, "activityType") === "recurring"
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
      flex: 1,
    },
    {
      field: "activityType",
      headerName: "Activity Type",
      flex: 1.1,
    },
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

  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activityList, setActivityList] = useState(loadingActivityList);
  const [editingActivity, setEditingActivity] = useState(false);

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
    setSelectedRow(activityList.filter((row) => selectedIDs.has(row.id))[0]);
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

  const getAllActivities = () => {
    let tempActivityList = [];
    activityService
      .getAllActivities()
      .then((response) => {
        tempActivityList = response.data;

        for (let i = 0; i < tempActivityList.length; ++i) {
          tempActivityList[i].id = i + 1;
        }
        setActivityList(tempActivityList);
      })
      .catch((error) => {
        alert(
          `Issue getting activities. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  const refreshActivities = () => {
    clearAllFields();
    setSelectedRow(null);
    setActivityList(loadingActivityList);
    getAllActivities();
  };

  useEffect(() => {
    getAllActivities();
  }, []);

  const handleEditActivity = () => {
    if (!selectedRow) {
      alert("Please select an activity to edit");
      return;
    } else {
      setDialogMaxWidth("xs");
      setEditingActivity(true);
      clearAllFields();
    }
  };

  const handleDeleteActivity = () => {
    if (!selectedRow) {
      alert("Please select an activity to delete");
      return;
    } else {
      activityService
        .deleteActivity(
          selectedRow.activityId,
          selectedRow.activityType === "planned" ? "plannedActivities" : "recurringActivities"
        )
        .then(() => {
          alert("Successfully deleted activity");
          props.setPlannerDataUpdate(!props.plannerDataUpdate);
        })
        .catch((error) => {
          alert(
            `Issue deleting activity. Error status code: ${error.response.status}. ${error.response.data.message}`
          );
        });
    }
  };

  return (
    <>
      <ListItem button onClick={handleDialogClickOpen} key="Search Activity">
        <ListItemIcon>
          <SearchIcon />
        </ListItemIcon>
        <ListItemText primary="Activities" />
      </ListItem>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth={dialogMaxWidth}
      >
        <DialogTitle id="form-dialog-title">
          {editingActivity ? "Edit Activity" : "Search Activities"}
        </DialogTitle>
        {editingActivity ? (
          <EditActivityDisplay
            activity={selectedRow}
            setEditingActivity={setEditingActivity}
            setDialogMaxWidth={setDialogMaxWidth}
            setSelectedRow={setSelectedRow}
            getAllActivities={getAllActivities}
            plannerDataUpdate={props.plannerDataUpdate}
            setPlannerDataUpdate={props.setPlannerDataUpdate}
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
                    label="Search Activities (by name)"
                    type="search"
                    value={searchText}
                    onChange={updateSearchText}
                    fullWidth
                    autoFocus
                  />
                </Grid>
                <Grid item className={classes.gridItem} />
                <Grid item className={classes.gridItem}>
                  <Typography>List of activities</Typography>
                </Grid>
                <Grid item className={classes.dataGrid}>
                  <DataGrid
                    rows={activityList}
                    columns={activityColumns}
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
                      <IconButton onClick={refreshActivities} variant="contained" color="primary">
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
                          onClick={handleDeleteActivity}
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
                          onClick={handleEditActivity}
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

SearchActivities.propTypes = {
  plannerDataUpdate: PropTypes.boolean,
  setPlannerDataUpdate: PropTypes.func,
};

export default SearchActivities;
