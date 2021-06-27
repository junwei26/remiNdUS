import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, Paper, Button } from "@material-ui/core";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import reminderPackageService from "../../../services/reminderPackageService";

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

const SubscribedPackages = () => {
  const classes = useStyles();

  const [searchText, setSearchText] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const loadingPackageList = [
    {
      id: 1,
      name: "Loading...",
      description: "Loading...",
      numberOfReminders: "Loading...",
      lastModified: "Loading...",
      packageTag: "Loading...",
    },
  ];
  const [packageList, setPackageList] = useState(loadingPackageList);
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
      valueFormatter: (datetime) => {
        return `${new Date(datetime.value).toLocaleDateString()}`;
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
        alert(
          `Issue getting reminder packages. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  const refreshPackages = () => {
    clearAllFields();
    setPackageList(loadingPackageList);
    getReminderPackages();
  };

  const deleteReminderPackages = () => {
    const reminderPackageIds = [];
    for (let i = 0; i < selectedRows.length; ++i) {
      reminderPackageIds.push(selectedRows[i].reminderPackageId);
    }

    reminderPackageService
      .deleteReminderPackages(reminderPackageIds)
      .then(() => {
        alert("Successfully deleted reminder packages!");
        refreshPackages();
      })
      .catch((error) => {
        alert(
          `Issue deleting reminder package. Error status code: ${error.response.status}. ${error.response.data.message}`
        );
      });
  };

  const handleSubmitDeletePackage = (e) => {
    e.preventDefault();
    deleteReminderPackages();
  };

  useEffect(() => {
    // get reminder packages on load up
    getReminderPackages();
  }, []);

  return (
    <>
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
                  Delete
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
