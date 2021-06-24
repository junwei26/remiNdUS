import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, Paper } from "@material-ui/core";
// import { Paper, Grid, TextField, Typography } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";

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
  //   //   const [packageList, setPackageList] = useState({});

  const packageColumns = [
    {
      field: "name",
      headerName: "Name",
      width: 150,
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
    },
    {
      field: "lastModified",
      headerName: "Last Modified",
      width: 250,
    },
  ];

  const updateSearchText = (e) => {
    setSearchText(e.target.value);
    //   update the packages being displayed
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
          <Typography>List of subscribed packages</Typography>
        </Grid>
        <Grid item style={{ width: "90%", height: "545px" }}>
          <DataGrid
            rows={[
              { id: 1, name: "test1", description: "A description", lastModified: "24 June 2021" },
              {
                id: 2,
                name: "thetest2",
                description: "A second description",
                lastModified: "26 June 2021",
              },
              {
                id: 3,
                name: "mytest3",
                description: "A third description",
                lastModified: "25 June 2021",
              },
            ]}
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
