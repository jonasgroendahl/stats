import React, { Component } from "react";
import "./StatsPage.css";
import StatsTable from "./components/StatsTable";
import Calendar from "./components/Calendar";
import LoadingModal from "./components/LoadingModal";
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
import api from "./config/api";
import { subDays, format } from "date-fns";

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
    type: "all",
    show: "All",
    customDateEl: null,
    start_date: "",
    end_date: "",
    gymId: 1060,
    gymName: '',
    sensors: [],
    token: 0,
    playerId: 1994,
    zoneId: 5970,
    loading: true,
    custom_start_date: "",
    custom_end_date: "",
    players: []
  };

  async componentDidMount() {
    const resultSensors = await api.get(`/v2/gyms/${this.state.gymId}/sensors`);
    api.get(`/v2/gyms/${this.state.gymId}/players`).then(result => {
      if (result.data.length > 0) {
        this.setState({ players: result.data });
      }
    });
    let gymName = '';
    let sensors = [];
    let zoneId = 5970;
    let playerId = 1994;
    if (resultSensors.data.length > 0) {
      console.log("Sensors found for client");
      gymName = resultSensors.data[0].firmanavn;
      sensors = resultSensors.data;
      zoneId = resultSensors.data[0].zone_id;
      playerId = resultSensors.data[0].player_id;
    }
    const token = await this.getToken();
    const body = {
      kundeid: this.state.gymId,
      start: "2018-08-22",
      end: "2018-08-29",
      zoneid: zoneId,
      token: token
    };
    const result = await api.post(
      `/v2/stats?summed=1&gym_id=${this.state.gymId}`,
      body
    );
    const startdate = format(subDays(new Date(), 7), "YYYY-MM-DD");
    const enddate = format(new Date(), "YYYY-MM-DD");
    this.setState({
      data: result.data,
      loading: false,
      start_date: startdate,
      end_date: enddate,
      sensors,
      gymName,
      playerId,
      zoneId
    });
    setInterval(() => {
      this.getToken();
      console.log("Getting a new token");
    }, 1740000);
  }

  getToken = () => {
    return new Promise(async resolve => {
      const result = await api.post(`/v1/sensors/vc`);
      this.setState({ token: result.data.access_token });
      resolve(result.data.access_token);
    });
  }

  handleReportChange = event => {
    console.log("handleReportChange");
    this.setState({ report: event.target.value }, () => this.getData());
  };


  getData = async () => {
    this.setState({ loading: true });
    let dataResponse;
    let body = {
      start:
        this.state.interval !== "custom"
          ? this.state.start_date
          : this.state.custom_start_date,
      end:
        this.state.interval !== "custom"
          ? this.state.end_date
          : this.state.custom_end_date,
      zoneid: this.state.zoneId,
      token: this.state.token,
      type: this.state.type
    };
    console.log("Sending body", body);
    if (this.state.report === "schedule_report") {
      if (this.state.token) {
        dataResponse = await api.post(
          `/v2/stats?gym_id=${this.state.gymId}`,
          body
        );
      } else {
        dataResponse = await api.get(`/v2/stats`);
      }
    } else if (this.state.report === "class_report") {
      dataResponse = await api.post(
        `/v2/stats?summed=1&gym_id=${this.state.gymId}`,
        body
      );
    } else if (this.state.report === "calendar_report") {
      body.type = 'scheduled';
      dataResponse = await api.post(
        `/v2/stats?&identitetid=${this.state.playerId}&gym_id=${
        this.state.gymId
        }`,
        body
      );
    }
    console.log("Data retrieval", dataResponse.data);
    this.setState({ data: dataResponse.data, loading: false });
  };

  setInterval = (start, end) => {
    this.setState(
      { custom_start_date: start, custom_end_date: end, interval: "custom" },
      () => this.getData()
    );
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handlePlayerChange = event => {
    this.setState({ playerId: event.target.value }, () => this.getData());
  };

  handleDateChange = event => {
    const end = format(new Date(), "YYYY-MM-DD");
    let start;
    switch (event.target.value) {
      case "1 week":
        start = format(subDays(new Date(), 7), "YYYY-MM-DD");
        break;
      case "3 weeks":
        start = format(subDays(new Date(), 21), "YYYY-MM-DD");
        break;
      case "3 months":
        start = format(subDays(new Date(), 90), "YYYY-MM-DD");
        break;
      default:
        start = format(subDays(new Date(), 7), "YYYY-MM-DD");
        break;
    }
    this.setState({
      start_date: start,
      end_date: end,
      interval: event.target.value
    });
  };

  toggleDatepicker = event => {
    console.log("Toggling datepicker");
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
      customDateEl,
      playerId,
      custom_end_date,
      custom_start_date
    } = this.state;
    return (
      <div className="App stats-container">
        <p>Gym name: {' '} {this.state.gymName}</p>
        <p>Count sensors available:</p>
        {this.state.sensors.map(sensor => <p>Sensor: {' '}{sensor.name}</p>)}
        <Grid container style={{ marginBottom: 12 }}>
          <Grid item xs={6}>
            <FormLabel component="legend">Select Report</FormLabel>
          </Grid>
          <Grid item xs={6}>
            <Select
              fullWidth
              value={report}
              onChange={this.handleReportChange}
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
        {report === "calendar_report" && (
          <Grid container style={{ marginBottom: 12 }}>
            <Grid item xs={6}>
              <FormLabel component="legend">Select Player</FormLabel>
            </Grid>
            <Grid item xs={6}>
              <Select onChange={this.handlePlayerChange} value={playerId} fullWidth>
                {this.state.players.map(player => <MenuItem value={player.identitetid}>{player.navn}</MenuItem>)}
              </Select>
            </Grid>
          </Grid>
        )}
        {report !== "calendar_report" && (
          <Grid container>
            <Grid item xs={6}>
              <FormLabel component="legend">Select Date Range</FormLabel>
            </Grid>
            <Grid item xs={6}>
              <RadioGroup
                className="row"
                onChange={this.handleDateChange}
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
                    customDateEl ||
                      (custom_start_date !== "" && custom_end_date !== "")
                      ? `${custom_start_date} - ${custom_end_date}`
                      : "Custom"
                  }
                  value="custom"
                />
              </RadioGroup>
            </Grid>
          </Grid>
        )}
        {report !== 'calendar_report' &&
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
                <FormControlLabel value="all" control={<Radio />} label="All" />
                <FormControlLabel
                  value="scheduled"
                  control={<Radio />}
                  label="Scheduled"
                />
                <FormControlLabel value="live" control={<Radio />} label="Live" />
                <FormControlLabel
                  value="ondemand"
                  control={<Radio />}
                  label="On Demand"
                />
              </RadioGroup>
            </Grid>
          </Grid>
        }
        {report !== "calendar_report" && (
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
        )}
        {report !== "calendar_report" && (
          <Button variant="raised" color="primary" onClick={this.getData}>
            Generate report
          </Button>
        )}
        {report !== "calendar_report" ? (
          <StatsTable data={data} report={report} />
        ) : (
            <Calendar data={data} setInterval={this.setInterval} />
          )}
        <Popper open={Boolean(customDateEl)} anchorEl={customDateEl}>
          <Card>
            <CardContent>
              <TextField
                type="date"
                name="custom_start_date"
                onChange={this.handleChange}
                style={{ marginRight: 10 }}
              />
              <TextField
                type="date"
                name="custom_end_date"
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
        <LoadingModal open={this.state.loading} />
      </div>
    );
  }
}

export default App;