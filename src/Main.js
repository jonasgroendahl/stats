import React, { Component, Fragment } from "react";
import "./StatsPage.css";
import StatsTable from "./components/StatsTable";
import Calendar from "./components/Calendar";
import LoadingModal from "./components/LoadingModal";
import {
  Select,
  MenuItem,
  Popper,
  Card,
  CardContent,
  CardActions,
  Divider,
  withStyles,
  IconButton
} from "@material-ui/core";
import { ChevronRight, ChevronLeft } from "@material-ui/icons";
import api from "./config/api";
import WebAPI from "./js/api";
import {
  subDays,
  format,
  addDays,
  differenceInDays,
  startOfWeek
} from "date-fns";
import Datepicker from "react-day-picker";
import "react-day-picker/lib/style.css";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";

const styles = {
  selected: {
    color: "var(--wteal)!important"
  },
  label: {
    color: "var(--black)"
  }
};

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
    show: 0,
    customDateEl: null,
    start_date: format(subDays(new Date(), 7), "YYYY-MM-DD"),
    end_date: format(new Date(), "YYYY-MM-DD"),
    gymId: 1060, // 1060 Pure Gym   124 GoodLife  5475 REPEAT århus
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
    eventType: 0, // 0 = ALL, SCHEDULED = 1, LIVE = 2, ON DEMAND = #,
    mode: 1
  };

  async componentDidMount() {
    let mode = 1;
    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get("gym_id")
        ? urlParams.get("gym_id")
        : this.state.gymId;
      mode = urlParams.has("mode") ? urlParams.get("mode") : this.state.mode;
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
        isCountEnabled,
        mode
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
      isChain,
      mode
    } = this.state;

    let dataResponse;

    let start =
      interval !== "custom"
        ? start_date
        : format(custom_start_date, "YYYY-MM-DD");
    let end =
      interval !== "custom" ? end_date : format(custom_end_date, "YYYY-MM-DD");

    try {
      if (report === "schedule_report") {
        dataResponse = await WebAPI.getScheduleReportData(
          token,
          gymId,
          playerId,
          start,
          end,
          type,
          show,
          isChain,
          mode
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
          isChain,
          mode
        );
      } else if (report === "calendar_report") {
        if (!setDefault) {
          const player = players.find(pl => pl.zone_id !== 0);
          console.log("Found a player", player);
          await this.setState({ playerId: player.identitetid });
          start = format(
            startOfWeek(new Date(), { weekStartsOn: 1 }),
            "YYYY-MM-DD"
          );
          end = format(addDays(start, 6), "YYYY-MM-DD");
          this.setState({ start_date: start, end_date: end });
        }
        dataResponse = await WebAPI.getScheduleReportData(
          token,
          gymId,
          this.state.playerId,
          start,
          end,
          type,
          show,
          isChain,
          mode
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
    } catch (e) {
      alert("An error occured trying to fetch data - Contact support");
      this.setState({ loading: false });
    }
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
      () => this.getData(true)
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

  handleDateChange = (event, value) => {
    console.log("handleDateChange", event, value);
    const end = format(new Date(), "YYYY-MM-DD");
    let start;
    switch (value) {
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
    console.log(value !== "custom");
    this.setState({
      start_date: start,
      end_date: end,
      interval: value
    });
    if (value !== "custom") {
      this.setState({ customDateEl: null });
    } else {
      this.toggleDatepicker(event);
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

  handleSettingChange = (name, value) => {
    console.log("handleSettingChange", name, value);
    this.setState({ [name]: value });
  };

  handleToggleBtnChange = (name, value) => {
    value !== null && this.setState({ [name]: value });
  };

  incrementWeek = async () => {
    const start_date = format(
      addDays(new Date(this.state.start_date), 7),
      "YYYY-MM-DD"
    );
    const end_date = format(
      addDays(new Date(this.state.end_date), 7),
      "YYYY-MM-DD"
    );
    await this.setState({ start_date, end_date });
    this.getData(true);
  };

  decrementWeek = async () => {
    const start_date = format(
      subDays(new Date(this.state.start_date), 7),
      "YYYY-MM-DD"
    );
    const end_date = format(
      subDays(new Date(this.state.end_date), 7),
      "YYYY-MM-DD"
    );
    await this.setState({ start_date, end_date });
    this.getData(true);
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
      isCountEnabled
    } = this.state;

    const { classes } = this.props;

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

    const customLabel =
      customDateEl || (custom_start_date !== "" && custom_end_date !== "")
        ? `${format(custom_start_date, "YYYY-MM-DD")} - ${format(
            custom_end_date,
            "YYYY-MM-DD"
          )}`
        : "Custom";

    return (
      <div className="stats-container">
        {`Current mode: ${
          this.state.mode
        } // 1 means subtract count_out (init as 0), 2 means no subtraction`}
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
            className="select"
          >
            <MenuItem value="class_report">Class title report</MenuItem>
            <MenuItem value="schedule_report">Schedule report</MenuItem>
            {isCountEnabled && (
              <MenuItem value="calendar_report">Calendar count report</MenuItem>
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
            className="select"
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
              <span>Date Range</span>
              <ToggleButtonGroup
                className="ToggleButton"
                exclusive
                value={interval}
                onChange={this.handleDateChange}
              >
                <ToggleButton
                  value="1 week"
                  className={
                    interval === "1 week" ? "ToggleButtonSelected" : ""
                  }
                >
                  Last 7 days
                </ToggleButton>
                <ToggleButton
                  value="3 weeks"
                  className={
                    interval === "3 weeks" ? "ToggleButtonSelected" : ""
                  }
                >
                  Last 30 days
                </ToggleButton>
                <ToggleButton
                  value="custom"
                  className={
                    interval === "custom" ? "ToggleButtonSelected" : ""
                  }
                >
                  {customLabel}
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </Fragment>
        )}
        <Divider />
        <div className="stats-container-row">
          <span>Event Type</span>
          <ToggleButtonGroup
            className="ToggleButton"
            exclusive
            value={type}
            onChange={(_, value) => this.handleToggleBtnChange("type", value)}
          >
            <ToggleButton
              value="all"
              className={type === "all" ? "ToggleButtonSelected" : ""}
            >
              All
            </ToggleButton>
            <ToggleButton
              value="scheduled"
              className={type === "scheduled" ? "ToggleButtonSelected" : ""}
            >
              Scheduled
            </ToggleButton>
            <ToggleButton
              value="live"
              className={type === "live" ? "ToggleButtonSelected" : ""}
            >
              Live
            </ToggleButton>
            <ToggleButton
              value="ondemand"
              className={type === "ondemand" ? "ToggleButtonSelected" : ""}
            >
              On Demand
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        {report !== "calendar_report" && (
          <Fragment>
            <Divider />
            <div className="stats-container-row">
              <span>Show</span>
              <ToggleButtonGroup
                className="ToggleButton"
                exclusive
                value={show}
                onChange={(_, value) =>
                  this.handleToggleBtnChange("show", value)
                }
              >
                <ToggleButton
                  value={0}
                  className={show === 0 ? "ToggleButtonSelected" : ""}
                >
                  Show
                </ToggleButton>
                <ToggleButton
                  value={1}
                  className={show === 1 ? "ToggleButtonSelected" : ""}
                >
                  Only Count enabled
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </Fragment>
        )}
        {report === "calendar_report" && (
          <Fragment>
            <Divider />
            <div className="stats-container-row">
              <span>Week:</span>
              <div className="flex center">
                <span className="week-label">
                  {`${format(start_date, "MMM DD")} - ${format(
                    end_date,
                    "MMM DD"
                  )}, 2018`}
                </span>
                <IconButton
                  style={{ marginRight: 5 }}
                  onClick={this.decrementWeek}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton onClick={this.incrementWeek}>
                  <ChevronRight />
                </IconButton>
              </div>
            </div>
          </Fragment>
        )}
        <button
          className="btn"
          onClick={this.getData}
          style={{ alignSelf: "flex-end" }}
        >
          Update report
        </button>
        {report !== "calendar_report" ? (
          <StatsTable
            data={data}
            report={report}
            sortByAttr={this.sortByAttr}
            mapCategory={this.mapCategory}
            show={show}
          />
        ) : (
          <Calendar
            data={data}
            setInterval={this.setInterval}
            start_date={start_date}
          />
        )}
        <Popper open={Boolean(customDateEl)} anchorEl={customDateEl}>
          <Card raised>
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

export default withStyles(styles)(App);
