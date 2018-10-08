import React, { Component, Fragment } from "react";
import "./StatsPage.css";
import StatsTable from "./components/StatsTable";
import Calendar from "./components/Calendar";
import LoadingModal from "./components/LoadingModal";
import {
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Popper,
  Card,
  CardContent,
  CardActions,
  Divider,
  BottomNavigation,
  BottomNavigationAction
} from "@material-ui/core";
import { ChevronRight, ChevronLeft } from "@material-ui/icons";
import Icon from "./components/Icon";
import api from "./config/api";
import WebAPI from "./js/api";
import { subDays, format, addDays, differenceInDays } from "date-fns";
import Datepicker from "react-day-picker";
import "react-day-picker/lib/style.css";

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
    show: "0",
    customDateEl: null,
    start_date: format(subDays(new Date(), 7), "YYYY-MM-DD"),
    end_date: format(new Date(), "YYYY-MM-DD"),
    gymId: 124, // 1060 Pure Gym
    gymName: "",
    sensors: [],
    token: 0,
    playerId: 0,
    loading: true,
    custom_start_date: "",
    custom_end_date: "",
    players: [],
    desc: false,
    isCountEnabled: false,
    isChain: 0,
    eventType: 0 // 0 = ALL, SCHEDULED = 1, LIVE = 2, ON DEMAND = #
  };

  async componentDidMount() {
    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("gym_id") ? urlParams.get("gym_id") : 124;
      const isChain = urlParams.get("chain") ? 1 : 0;
      await this.setState({ gymId: id, isChain });
    }

    const resultSensors = await WebAPI.getSensors(this.state.gymId);
    const players = await WebAPI.getPlayers(this.state.gymId);

    let isCountEnabled = false;

    if (players.data.length > 0) {
      const playersMapped = players.data.map(player => {
        const sensor = resultSensors.data.find(
          sensor => player.identitetid === sensor.player_id
        );
        if (sensor && !isCountEnabled) {
          isCountEnabled = true;
        }
        return { ...player, zone_id: sensor ? sensor.zone_id : 0 };
      });
      this.setState({ players: playersMapped });
    }

    await this.getToken();
    this.setState(
      {
        loading: false,
        sensors: resultSensors.data,
        isCountEnabled
      },
      () => this.getData()
    );

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
  };

  handleReportChange = event => {
    console.log("handleReportChange");
    if (event.target.value === "calendar_report") {
      this.setState({ playerId: this.state.players[1].identitetid });
    }
    this.setState({ report: event.target.value }, () => this.getData());
  };

  /* setDefault is used for setting the proper playerId when switching to calendar view */
  getData = async setDefault => {
    this.setState({ loading: true });

    const {
      interval,
      type,
      token,
      show,
      custom_end_date,
      custom_start_date,
      gymId,
      players,
      playerId,
      report,
      start_date,
      end_date,
      isChain
    } = this.state;

    let dataResponse;

    const start =
      interval !== "custom"
        ? start_date
        : format(custom_start_date, "YYYY-MM-DD");
    const end =
      interval !== "custom" ? end_date : format(custom_end_date, "YYYY-MM-DD");

    if (report === "schedule_report") {
      dataResponse = await WebAPI.getScheduleReportData(
        token,
        gymId,
        playerId,
        start,
        end,
        type,
        show,
        isChain
      );
    } else if (report === "class_report") {
      dataResponse = await WebAPI.getClassReportData(
        token,
        gymId,
        playerId,
        start,
        end,
        type,
        show,
        isChain
      );
    } else if (report === "calendar_report") {
      if (!setDefault) {
        const player = players.find(pl => pl.zone_id !== 0);
        console.log("Found a player", player);
        await this.setState({ playerId: player.identitetid });
      }
      dataResponse = await WebAPI.getScheduleReportData(
        token,
        gymId,
        this.state.playerId,
        start,
        end,
        "scheduled",
        show,
        isChain
      );
    }
    console.log("Data retrieval", dataResponse.data);
    const formattedData = dataResponse.data
      .map(stat => {
        return {
          ...stat,
          video_category: this.mapCategory(stat.video_category),
          avg: (stat.count / stat.views).toFixed(2),
          video_title_long: stat.video_title_long.replace(/[?]/g, "")
        };
      })
      .sort((a, b) => (a.views > b.views ? -1 : 1));
    this.setState({ data: formattedData, loading: false });
  };

  mapCategory = category => {
    switch (category) {
      case "D":
        return "Mind Body";
      case "S":
        return "Conditioning";
      case "W":
        return "Cardio";
      case "C":
        return "Cycling";
      case "K":
        return "Kids";
      case "G":
        return "Senior";
      default:
        return "Live";
    }
  };

  setInterval = (start, end) => {
    this.setState(
      { custom_start_date: start, custom_end_date: end, interval: "custom" },
      () => this.getData(false)
    );
  };

  handleChange = event => {
    console.log("handleChange", event.target.name, event.target.value);
    this.setState({ [event.target.name]: event.target.value });
  };

  handleDatePickerChange = (value, name) => {
    const { custom_start_date, custom_end_date } = this.state;
    console.log(value, name, differenceInDays(value, custom_end_date));
    if (
      (name === "custom_end_date" && value < custom_start_date) ||
      Math.abs(differenceInDays(value, custom_start_date)) > 120
    ) {
    } else if (
      (name === "custom_start_date" && value > custom_end_date) ||
      Math.abs(differenceInDays(value, custom_end_date)) > 120
    ) {
    } else {
      this.setState({ [name]: value });
    }
  };

  handlePlayerChange = event => {
    this.setState({ playerId: event.target.value }, () => {
      if (this.state.report === "calendar_report") {
        this.getData();
      }
    });
  };

  handleDateChange = event => {
    console.log("handleDateChange", event.target.value);
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
    console.log(event.target.value !== "custom");
    this.setState({
      start_date: start,
      end_date: end,
      interval: event.target.value
    });
    if (event.target.value !== "custom") {
      this.setState({ customDateEl: null });
    }
  };

  toggleDatepicker = event => {
    this.setState({
      customDateEl: event.target,
      custom_start_date: new Date(),
      custom_end_date: addDays(new Date(), 1)
    });
  };

  sortByAttr = title => {
    const data = [...this.state.data];
    const sortedArr = data.sort((a, b) =>
      this.sort(a, b, title, this.state.desc)
    );
    this.setState({ data: sortedArr, desc: !this.state.desc });
  };

  sort = (a, b, orderBy, desc) => {
    if (desc) {
      return a[orderBy] > b[orderBy] ? 1 : a[orderBy] < b[orderBy] ? -1 : 0;
    } else {
      return a[orderBy] > b[orderBy] ? -1 : a[orderBy] < b[orderBy] ? 1 : 0;
    }
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
      custom_start_date,
      isCountEnabled,
      eventType
    } = this.state;

    const navElement = ({ month, onPreviousClick, onNextClick }) => (
      <div className="DayPicker-Custom-Nav">
        {format(new Date(month), "MMM YYYY")}
        <div className="ml-auto">
          <ChevronLeft
            className="DayPicker-Custom-Nav-Arrow"
            onClick={() => onPreviousClick()}
          />
          <ChevronRight
            className="DayPicker-Custom-Nav-Arrow"
            onClick={() => onNextClick()}
          />
        </div>
      </div>
    );

    let header;
    switch (report) {
      case "class_report":
        header = "Class title report";
        break;
      case "schedule_report":
        header = "Schedule report";
        break;
      case "calendar_report":
        header = "Calendar count report";
        break;
      default:
        header = "";
        break;
    }

    return (
      <div className="stats-container">
        {/*<p>Gym name: {this.state.gymName}</p>
        <p>Count sensors available:</p>
        {this.state.sensors.map(sensor => (
          <p>Sensor: {sensor.name}</p>
        ))}*/}
        <h1 className="header" style={{ alignSelf: "flex-start" }}>
          {header}
        </h1>
        <div className="stats-container-row">
          <span>Select Report</span>
          <Select
            value={report}
            onChange={this.handleReportChange}
            name="report"
            disableUnderline
          >
            <MenuItem value="class_report">Class title report</MenuItem>
            <MenuItem value="schedule_report">Schedule report</MenuItem>
            {isCountEnabled && (
              <MenuItem value="calendar_report">
                Wexer Count calendar report
              </MenuItem>
            )}
          </Select>
        </div>
        <Divider />
        <div className="stats-container-row">
          <span>Select Player</span>
          <Select
            onChange={this.handlePlayerChange}
            value={playerId}
            disableUnderline
          >
            {report !== "calendar_report" && <MenuItem value={0}>All</MenuItem>}
            {report !== "calendar_report"
              ? this.state.players.map(player => (
                  <MenuItem key={player.identitetid} value={player.identitetid}>
                    {player.navn}
                  </MenuItem>
                ))
              : this.state.players
                  .filter(pl => pl.zone_id !== 0)
                  .map(player => (
                    <MenuItem
                      value={player.identitetid}
                      key={player.identitetid}
                    >
                      {player.navn}
                    </MenuItem>
                  ))}
          </Select>
        </div>
        {report !== "calendar_report" && (
          <Fragment>
            <Divider />
            <div className="stats-container-row">
              <span>Select Date Range</span>
              <div>
                <RadioGroup
                  className="row"
                  onChange={this.handleDateChange}
                  name="interval"
                  value={interval}
                >
                  <FormControlLabel
                    value="1 week"
                    control={<Radio />}
                    label="Last 7 days"
                  />
                  <FormControlLabel
                    value="3 weeks"
                    control={<Radio />}
                    label="Last 30 days"
                  />
                  <FormControlLabel
                    value="3 months"
                    control={<Radio />}
                    label="Last 90 days"
                  />
                  <FormControlLabel
                    control={<Radio onClick={this.toggleDatepicker} />}
                    label={
                      customDateEl ||
                      (custom_start_date !== "" && custom_end_date !== "")
                        ? `${format(
                            custom_start_date,
                            "YYYY-MM-DD"
                          )} - ${format(custom_end_date, "YYYY-MM-DD")}`
                        : "Custom"
                    }
                    value="custom"
                  />
                </RadioGroup>
              </div>
            </div>
          </Fragment>
        )}
        {report !== "calendar_report" && (
          <Fragment>
            <Divider />
            <div className="stats-container-row">
              <span>Type</span>
              <div>
                <RadioGroup
                  className="row"
                  onChange={this.handleChange}
                  name="type"
                  value={type}
                >
                  <FormControlLabel
                    value="all"
                    control={<Radio />}
                    label="All"
                  />
                  <FormControlLabel
                    value="scheduled"
                    control={<Radio />}
                    label="Scheduled"
                  />
                  <FormControlLabel
                    value="live"
                    control={<Radio />}
                    label="Live"
                  />
                  <FormControlLabel
                    value="ondemand"
                    control={<Radio />}
                    label="On Demand"
                  />
                </RadioGroup>
              </div>
            </div>
          </Fragment>
        )}
        {report !== "calendar_report" && (
          <Fragment>
            <Divider />
            <div className="stats-container-row">
              <span>Show</span>
              <div>
                <RadioGroup
                  className="row"
                  onChange={this.handleChange}
                  name="show"
                  value={show}
                >
                  <FormControlLabel
                    value={"0"}
                    control={<Radio />}
                    label="All"
                  />
                  <FormControlLabel
                    value={"1"}
                    control={<Radio />}
                    label="Only Count enabled"
                  />
                </RadioGroup>
              </div>
            </div>
          </Fragment>
        )}
        {report === "calendar_report" && (
          <Fragment>
            <Divider />
            <div className="stats-container-row">
              <span>Event type</span>
              <div className="flex center">
                <BottomNavigation
                  showLabels
                  className="bottom-nav"
                  value={eventType}
                  onChange={(_, value) =>
                    console.log(value) || this.setState({ eventType: value })
                  }
                >
                  <BottomNavigationAction label="All" />
                  <BottomNavigationAction label="Scheduled" />
                  <BottomNavigationAction label="Live" />
                  <BottomNavigationAction label="On Demand" />
                </BottomNavigation>
              </div>
            </div>
            <Divider />
            <div className="stats-container-row">
              <span>Week:</span>
              <div className="flex center">
                <span style={{ marginRight: 20 }}>
                  {`${format(start_date, "MMM DD")} - ${format(
                    end_date,
                    "MMM DD"
                  )}, 2018`}
                </span>
                <ChevronLeft style={{ marginRight: 5 }} />
                <ChevronRight />
              </div>
            </div>
            <button className="btn" style={{ alignSelf: "flex-end" }}>
              Update report
            </button>
          </Fragment>
        )}
        {report !== "calendar_report" && (
          <button
            className="btn"
            onClick={this.getData}
            style={{ alignSelf: "flex-end" }}
          >
            Generate report
          </button>
        )}
        {report !== "calendar_report" ? (
          <StatsTable
            data={data}
            report={report}
            sortByAttr={this.sortByAttr}
            mapCategory={this.mapCategory}
            show={show}
          />
        ) : (
          <Calendar data={data} setInterval={this.setInterval} />
        )}
        <Popper open={Boolean(customDateEl)} anchorEl={customDateEl}>
          <Card>
            <CardContent className="flex" id="test">
              <div style={{ marginRight: 25 }}>
                <Datepicker
                  selectedDays={[custom_start_date]}
                  onDayClick={value =>
                    this.handleDatePickerChange(value, "custom_start_date")
                  }
                  navbarElement={navElement}
                />
              </div>
              <div>
                <Datepicker
                  selectedDays={[custom_end_date]}
                  onDayClick={value =>
                    this.handleDatePickerChange(value, "custom_end_date")
                  }
                  navbarElement={navElement}
                />
              </div>
            </CardContent>
            <CardActions>
              <button
                className="btn-flat"
                onClick={() =>
                  this.setState({
                    customDateEl: null,
                    interval: "1 week",
                    start_date: format(subDays(new Date(), 7), "YYYY-MM-DD"),
                    end_date: format(new Date(), "YYYY-MM-DD")
                  })
                }
              >
                Cancel
              </button>
              <button
                disabled={!start_date || !end_date}
                className="btn ml-auto"
                onClick={() => this.setState({ customDateEl: null })}
              >
                Apply
              </button>
            </CardActions>
          </Card>
        </Popper>
        <LoadingModal open={this.state.loading} />
      </div>
    );
  }
}

export default App;
