import React, { PureComponent, Fragment } from "react";
import {
  Button,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow
} from "@material-ui/core";
import { ImportExport } from "@material-ui/icons";
import { format } from "date-fns";
import XlsExport from "xlsexport";

export default class StatsTable extends PureComponent {

  mapCategory = (category) => {
    switch (category) {
      case 'D':
        return 'Mind Body';
      case 'S':
        return 'Conditioning';
      case 'W':
        return 'Cardio';
      case 'C':
        return 'Cycling';
      case 'K':
        return 'Kids';
      default:
        return 'Senior';
    }
  }

  exportData = () => {
    console.log('exporting data');
    let mappedData = null;
    if (this.props.report === 'schedule_report') {
      mappedData = this.props.data.map(dataEntry => ({
        title: dataEntry.video_title_long,
        date: format(new Date(dataEntry.datostempel), "dddd Do MMMM"),
        start: format(new Date(dataEntry.datostempel), "HH:mm"),
        count: dataEntry.count,
        type: dataEntry.video_typeid === 100 ? "Live" : dataEntry.ondemand_selections ? "On-Demand" : "Scheduled"
      }))
    }
    else {
      mappedData = this.props.data.map(dataEntry => ({
        title: dataEntry.video_title_long,
        category: this.mapCategory(dataEntry.video_category),
        level: dataEntry.video_level,
        provider: dataEntry.providername,
        views: dataEntry.views,
        count: dataEntry.count,
        avg: (dataEntry.count / dataEntry.views).toFixed(2)
      }))
    }
    const xls = new XlsExport(mappedData, 'Stats report');
    xls.exportToXLS('stats_export.xls');
  }

  render() {
    let report = null;
    if (this.props.report === "schedule_report") {
      report = (
        <Fragment>
          <h1>Schedule report</h1>
          <div className="flex">
            <p>
              This report shows each individual event with Wexer Count data if
              it is available.
            </p>
            <Button style={{ marginLeft: "auto" }} onClick={this.exportData}>
              EXPORT <ImportExport style={{ marginLeft: 15 }} />
            </Button>
          </div>
          <div className="table-wrapper">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Start time</TableCell>
                  <TableCell numeric>Head count</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.data.map(dataEntry => (
                  <TableRow>
                    <TableCell>{dataEntry.video_title_long}</TableCell>
                    <TableCell>
                      {format(new Date(dataEntry.datostempel), "dddd Do MMMM")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(dataEntry.datostempel), "HH:mm")}
                    </TableCell>
                    <TableCell numeric>{dataEntry.count}</TableCell>
                    <TableCell>
                      {dataEntry.video_typeid === 100 ? "Live" : dataEntry.ondemand_selections ? "On-Demand" : "Scheduled"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Fragment>
      );
    } else if (this.props.report === "class_report") {
      report = (
        <Fragment>
          <h1>Class title report </h1>
          <div className="flex">
            <p>
              This report shows the total number of views for each title within
              the selected timeframe.
            </p>
            <Button style={{ marginLeft: "auto" }} onClick={this.exportData}>
              EXPORT <ImportExport style={{ marginLeft: 15 }} />
            </Button>
          </div>
          <div className="table-wrapper">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell numeric>Views</TableCell>
                  <TableCell numeric>Count</TableCell>
                  <TableCell numeric>Avg</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.data.map(dataEntry => (
                  <TableRow>
                    <TableCell>{dataEntry.video_title_long}</TableCell>
                    <TableCell>{this.mapCategory(dataEntry.video_category)}</TableCell>
                    <TableCell>{dataEntry.video_level}</TableCell>
                    <TableCell>{dataEntry.providername}</TableCell>
                    <TableCell numeric>{dataEntry.views}</TableCell>
                    <TableCell numeric>{dataEntry.count}</TableCell>
                    <TableCell numeric>{(dataEntry.count / dataEntry.views).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Fragment>
      );
    }
    return <div className="full-width">{report}</div>;
  }
}
