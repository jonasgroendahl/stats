import React, { Component, Fragment } from "react";
import "./StatsPage.css";
import {
  Table,
  TableHead,
  TableCell,
  TableBody,
  FormControl,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Radio,
  TableRow
} from "@material-ui/core";

class App extends Component {
  state = {
    data: [
      {
        name:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, nulla.",
        views: 44,
        provider_name: "Les Mills"
      }
    ],
    interval: "1 week"
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { data, interval } = this.state;
    return (
      <div className="App stats-container">
        <FormControl>
          <FormLabel component="legend">Select Date Range</FormLabel>
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
              value="disabled"
              disabled
              control={<Radio />}
              label="Custom"
            />
          </RadioGroup>
        </FormControl>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Lorem.</TableCell>
              <TableCell numeric>Lorem, ipsum.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(dataEntry => (
              <TableRow>
                <TableCell>{dataEntry.name}</TableCell>
                <TableCell>{dataEntry.provider_name}</TableCell>
                <TableCell numeric>{dataEntry.views}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default App;
