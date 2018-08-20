import React, { Component } from "react";
import "./StatsPage.css";
import StatsTable from "./components/StatsTable";
import Calendar from "./components/Calendar";
import {
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Radio,
  Grid,
  Select,
  MenuItem,
  Button,
  TextField,
  Popper,
  Card,
  CardContent
} from "@material-ui/core";
import axios from "axios";

class App extends Component {
  state = {
    data: [
      {
        name:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, nulla.",
        views: 44,
        date: "2018-05-05 16:00:00",
        type: "Scheduled",
        provider_name: "Club Virtual Bike",
        category: "Cycling",
        level: "Beginner",
        avg: 20,
        count: 22
      }
    ],
    report: "class_report",
    interval: "1 week",
    type: "All",
    show: "All",
    customDateEl: null,
    start_date: "",
    end_date: "",
    gymId: 124
  };

  async componentDidMount() {
    const result = await axios.get(
      `http://localhost:3001/v2/stats?summed=1&gym_id=${this.state.gymId}`
    );
    console.log(result);
    this.setState({ data: result.data });
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  toggleDatepicker = event => {
    this.setState({ customDateEl: event.target });
  };

  render() {
    const {
      data,
      interval,
      type,
      show,
      report,
      start_date,
      end_date,
      customDateEl
    } = this.state;
    return (
      <div className="App stats-container">
        <Grid container style={{ marginBottom: 12 }}>
          <Grid item xs={6}>
            <FormLabel component="legend">Select Report</FormLabel>
          </Grid>
          <Grid item xs={6}>
            <Select
              fullWidth
              value={report}
              onChange={this.handleChange}
              name="report"
            >
              <MenuItem value="class_report">Class title report</MenuItem>
              <MenuItem value="schedule_report">Schedule report</MenuItem>
              <MenuItem value="calendar_report">
                Wexer Count calendar report
              </MenuItem>
            </Select>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <FormLabel component="legend">Select Date Range</FormLabel>
          </Grid>
          <Grid item xs={6}>
            <RadioGroup
              className="row"
              onChange={this.handleChange}
              name="interval"
              value={interval}
            >
              <FormControlLabel
                value="1 week"
                control={<Radio />}
                label="1 week"
              />
              <FormControlLabel
                value="3 weeks"
                control={<Radio />}
                label="3 weeks"
              />
              <FormControlLabel
                value="3 months"
                control={<Radio />}
                label="3 months"
              />
              <FormControlLabel
                control={<Radio onClick={this.toggleDatepicker} />}
                label={
                  customDateEl || (start_date !== "" && end_date !== "")
                    ? `${start_date} - ${end_date}`
                    : "Custom"
                }
                value="custom"
              />
            </RadioGroup>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <FormLabel component="legend">Type</FormLabel>
          </Grid>
          <Grid item xs={6}>
            <RadioGroup
              className="row"
              onChange={this.handleChange}
              name="type"
              value={type}
            >
              <FormControlLabel value="All" control={<Radio />} label="All" />
              <FormControlLabel
                value="Scheduled"
                control={<Radio />}
                label="Scheduled"
              />
              <FormControlLabel value="Live" control={<Radio />} label="Live" />
              <FormControlLabel
                value="On Demand"
                control={<Radio />}
                label="On Demand"
              />
            </RadioGroup>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={6}>
            <FormLabel>Show</FormLabel>
          </Grid>
          <Grid item xs={6}>
            <RadioGroup
              className="row"
              onChange={this.handleChange}
              name="show"
              value={show}
            >
              <FormControlLabel value="All" control={<Radio />} label="All" />
              <FormControlLabel
                value="Only Count enabled"
                control={<Radio />}
                label="Only Count enabled"
              />
            </RadioGroup>
          </Grid>
        </Grid>
        <Button variant="raised">Generate report</Button>
        {report !== "calendar_report" ? (
          <StatsTable data={data} report={report} />
        ) : (
          <Calendar />
        )}
        <Popper open={Boolean(customDateEl)} anchorEl={customDateEl}>
          <Card>
            <CardContent>
              <TextField
                type="date"
                name="start_date"
                onChange={this.handleChange}
                style={{ marginRight: 10 }}
              />
              <TextField
                type="date"
                name="end_date"
                onChange={this.handleChange}
              />
              <Button
                onClick={() =>
                  this.setState({
                    customDateEl: null,
                    interval: "1 week",
                    start_date: "",
                    end_date: ""
                  })
                }
              >
                Cancel
              </Button>
              <Button
                disabled={!start_date || !end_date}
                variant="outlined"
                onClick={() => this.setState({ customDateEl: null })}
              >
                Apply
              </Button>
            </CardContent>
          </Card>
        </Popper>
      </div>
    );
  }
}

export default App;
