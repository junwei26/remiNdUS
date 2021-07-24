import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Typography,
  TextField,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import PropTypes from "prop-types";
import RefreshIcon from "@material-ui/icons/Refresh";
import EditIcon from "@material-ui/icons/Edit";
import ShareIcon from "@material-ui/icons/Share";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
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
    height: "500px",
  },
}));

const SubscribedPackages = (props) => {
  const classes = useStyles();

  const [searchText, setSearchText] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const loadingPackageList = [
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
  const [packageList, setPackageList] = useState(loadingPackageList);
  const [currentAlert, setCurrentAlert] = useState({ severity: "", message: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };
  const packageColumns = [
    {
      field: "name",
      headerName: "Name",
      flex: 0.7,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.2,
    },
    {
      field: "packageTag",
      headerName: "Tag",
      flex: 0.7,
    },
    {
      field: "ownerName",
      headerName: "Owner",
      flex: 1,
      hide: true,
    },
    {
      field: "public",
      headerName: "Public",
      flex: 0.8,
      hide: true,
    },
    {
      field: "verified",
      headerName: "Verified",
      flex: 1,
      hide: true,
    },
    {
      field: "lastModified",
      headerName: "Last Modified",
      flex: 1,
      valueFormatter: (params) => {
        return `${localService.parseTimeToString(params.value)}`;
      },
    },
    {
      field: "numberOfReminders",
      headerName: "Reminders",
      flex: 0.8,
      hide: true,
    },
  ];

  const handleDataGridSelectionChange = (e) => {
    const selectedIDs = new Set(e.selectionModel);
    setSelectedRows(packageList.filter((row) => selectedIDs.has(row.id)));
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

  const getReminderPackages = () => {
    let tempPackageList = [];
    reminderPackageService
      .getReminderPackages()
      .then((response) => {
        tempPackageList = response.data;

        for (let i = 0; i < tempPackageList.length; ++i) {
          tempPackageList[i].id = i + 1;
        }
        setPackageList(tempPackageList);
      })
      .catch((error) => {
        if (!error.response) {
          setCurrentAlert({ severity: "error", message: "Issue accessing reminder package API" });
          setSnackbarOpen(true);
        } else {
          setCurrentAlert({
            severity: "error",
            message: `Issue getting reminder packages. Error status code: ${error.response.status}. ${error.response.data.message}`,
          });
          setSnackbarOpen(true);
        }
      });
  };

  const refreshPackages = () => {
    clearAllFields();
    setPackageList(loadingPackageList);
    getReminderPackages();
  };

  const handleSubmitEditPackage = (e) => {
    e.preventDefault();
    if (selectedRows.length !== 1) {
      setCurrentAlert({
        severity: "error",
        message: "Please select only one reminder package when choosing to edit",
      });
      setSnackbarOpen(true);
      return;
    } else {
      props.setSelectedReminderPackage(selectedRows[0]);
      props.setView("Create Packages");
    }
  };

  const handleSubmitDeletePackage = (e) => {
    e.preventDefault();
    deleteReminderPackages();
  };

  const deleteReminderPackages = () => {
    const reminderPackageIds = [];
    for (let i = 0; i < selectedRows.length; ++i) {
      reminderPackageIds.push(selectedRows[i].reminderPackageId);
    }

    reminderPackageService
      .deleteReminderPackages(reminderPackageIds)
      .then(() => {
        setCurrentAlert({
          severity: "success",
          message: "Successfully deleted reminder packages!",
        });
        setSnackbarOpen(true);
        refreshPackages();
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message: `Issue deleting reminder package. Error status code: ${error.response.status}. ${error.response.data.message}`,
        });
        setSnackbarOpen(true);
      });
  };

  const shareReminderPackages = () => {
    const reminderPackageIds = [];
    for (let i = 0; i < selectedRows.length; ++i) {
      reminderPackageIds.push(selectedRows[i].reminderPackageId);
    }

    reminderPackageService
      .shareReminderPackages(reminderPackageIds, true)
      .then(() => {
        setCurrentAlert({
          severity: "success",
          message: "Successfully shared reminder packages!",
        });
        setSnackbarOpen(true);
        refreshPackages();
      })
      .catch((error) => {
        setCurrentAlert({
          severity: "error",
          message: `Issue sharing reminder package. Error status code: ${error.response.status}. ${error.response.data.message}`,
        });
        setSnackbarOpen(true);
      });
  };

  const handleSubmitSharePackages = (e) => {
    e.preventDefault();
    shareReminderPackages();
  };

  useEffect(() => {
    // get reminder packages on load up
    getReminderPackages();
  }, []);

  return (
    <>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert severity={currentAlert.severity}>
          <AlertTitle>{currentAlert.message}</AlertTitle>
        </Alert>
      </Snackbar>
      <Typography>Your Reminder Packages</Typography>
      <Paper elevation={2} variant="outlined" style={{ height: "780px" }}>
        <form
          noValidate
          autoComplete="off"
          onSubmit={handleSubmitDeletePackage}
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
                label="Search Packages (by name)"
                type="search"
                value={searchText}
                onChange={updateSearchText}
                fullWidth
              />
            </Grid>
            <Grid item className={classes.gridItem} />
            <Grid item className={classes.gridItem}>
              <Typography>List of reminder packages</Typography>
            </Grid>
            <Grid item className={classes.dataGrid}>
              <DataGrid
                rows={packageList}
                columns={packageColumns}
                autoPageSize
                checkboxSelection
                filterModel={{
                  items: [{ columnField: "name", operatorValue: "contains", value: searchText }],
                }}
                onSelectionModelChange={handleDataGridSelectionChange}
                selectionModel={selectionModel}
                isRowSelectable={(params) => {
                  return !params.row.subscribed;
                }}
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
                  <Tooltip title="Edit" aria-label="edit">
                    <IconButton
                      onClick={handleSubmitEditPackage}
                      variant="contained"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Share" aria-label="share">
                    <IconButton
                      onClick={handleSubmitSharePackages}
                      variant="contained"
                      color="primary"
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip title="Delete" aria-label="delete">
                    <IconButton type="submit" variant="contained" color="primary">
                      <DeleteForeverIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

SubscribedPackages.propTypes = {
  setSelectedReminderPackage: PropTypes.func,
  setView: PropTypes.func,
};

export default SubscribedPackages;
