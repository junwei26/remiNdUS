import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, Paper } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
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
    height: "545px",
  },
}));

const SubscribedPackages = () => {
  const classes = useStyles();

  const [searchText, setSearchText] = useState("");
  const [packageList, setPackageList] = useState([
    {
      id: 1,
      name: "Loading...",
      description: "Loading...",
      numberOfReminders: "Loading...",
      lastModified: "Loading...",
      packageTag: "Loading...",
    },
  ]);
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
      field: "numberOfReminders",
      headerName: "No. of Reminders",
      flex: 1,
    },
    {
      field: "lastModified",
      headerName: "Last Modified",
      flex: 1,
    },
    {
      field: "packageTag",
      headerName: "Package Tag",
      flex: 0.8,
    },
  ];

  useEffect(() => {
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
  }, []);

  const updateSearchText = (e) => {
    setSearchText(e.target.value);
  };

  return (
    <>
      <Typography>Your Subscribed Packages</Typography>
      <Paper elevation={2} variant="outlined" style={{ height: "780px" }}>
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
            <Typography>List of subscribed reminder packages</Typography>
          </Grid>
          <Grid item className={classes.dataGrid}>
            <DataGrid
              rows={packageList}
              columns={packageColumns}
              pageSize={8}
              checkboxSelection
              filterModel={{
                items: [{ columnField: "name", operatorValue: "contains", value: searchText }],
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default SubscribedPackages;
