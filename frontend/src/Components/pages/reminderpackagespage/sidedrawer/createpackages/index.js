import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, TextField, Paper, Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";

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
  const [searchRemindersText, setSearchRemindersText] = useState("");
  const reminderList = [
    {
      id: 1,
      name: "Loading...",
      description: "Loading...",
      dateTime: "Loading...",
    },
  ];

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
      field: "dateTime",
      headerName: "Datetime",
      flex: 1,
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

  const clearAllFields = () => {
    setPackageName("");
    setDescription("");
    setPackageTag("");
    setSearchRemindersText("");
  };

  const handleSubmitCreatePackage = (e) => {
    e.preventDefault();
  };

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
                label="Package Tag"
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
                pageSize={8}
                checkboxSelection
                filterModel={{
                  items: [
                    { columnField: "name", operatorValue: "contains", value: searchRemindersText },
                  ],
                }}
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
                <Button onClick={clearAllFields} variant="contained" color="primary">
                  Clear
                </Button>
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
