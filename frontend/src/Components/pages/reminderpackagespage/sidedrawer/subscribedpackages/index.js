import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, Paper } from "@material-ui/core";
// import { Paper, Grid, TextField, Typography } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import getReminderPackages from "../../../services/reminderPackagesService";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
    padding: "20px",
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
  ];

  useEffect(() => {
    let tempPackageList = [];
    getReminderPackages()
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
    <Paper elevation={2} variant="outlined" style={{ height: "800px" }}>
      <Grid
        container
        className={classes.root}
        direction="column"
        justify="flex-start"
        alignItems="center"
        spacing={2}
      >
        <Grid item style={{ width: "90%" }}>
          <TextField
            label="Search Packages (by name)"
            type="search"
            value={searchText}
            onChange={updateSearchText}
            style={{ width: "100%" }}
          />
        </Grid>
        <Grid item></Grid>
        <Grid item style={{ width: "90%" }}>
          <Typography>List of subscribed reminder packages</Typography>
        </Grid>
        <Grid item style={{ width: "90%", height: "545px" }}>
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
  );
};

export default SubscribedPackages;
