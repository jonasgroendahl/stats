import React, { Component, Fragment } from "react";
import "./StatsPage.css";
import { Table, TableHead, TableCell, TableBody } from "@material-ui/core";

class App extends Component {
  state = {
    data: [
      {
        name:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, nulla.",
        views: 44,
        provider_name: "Les Mills"
      }
    ]
  };
  render() {
    const { data } = this.state;
    return (
      <div className="App stats-container">
        <Table>
          <TableHead>
            <TableCell>Name</TableCell>
            <TableCell>Lorem.</TableCell>
            <TableCell numeric>Lorem, ipsum.</TableCell>
          </TableHead>
          <TableBody>
            {data.map(dataEntry => (
              <Fragment>
                <TableCell>{dataEntry.name}</TableCell>
                <TableCell>{dataEntry.provider_name}</TableCell>
                <TableCell numeric>{dataEntry.views}</TableCell>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default App;
