import React, { PureComponent, Fragment } from "react";
import {
  Button,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  TableSortLabel,
  Tooltip,
  SnackbarContent
} from "@material-ui/core";
import ExportArrow from "@material-ui/icons/ArrowDropDownCircle";
import { Info } from "@material-ui/icons";
import { format } from "date-fns";
import XlsExport from "xlsexport";

export default class StatsTable extends PureComponent {
  state = {
    orderBy: "",
    orderDirection: "asc",
    class_report_attr: [
      { value: "video_title_long", text: "Title" },
      { value: "video_category", text: "Category" },
      { value: "video_level", text: "Level" },
      { value: "providername", text: "Provider" },
      { value: "views", text: "Views" },
      { value: "count", text: "Count" },
      { value: "avg", text: "Avg" }
    ],
    schedule_report_attr: [
      { value: "video_title_long", text: "Title" },
      { value: "datostempel", text: "Date" },
      { value: "datostempel", text: "Start" },
      { value: "count", text: "Head count" },
      { value: "type", text: "Type" }
    ]
  };

  exportData = () => {
    console.log("exporting data");
    let mappedData = null;
    if (this.props.report === "schedule_report") {
      mappedData = this.props.data.map(dataEntry => ({
        title: dataEntry.video_title_long,
        date: format(new Date(dataEntry.datostempel), "dddd Do MMMM"),
        start: format(new Date(dataEntry.datostempel), "HH:mm"),
        count: dataEntry.count,
        type:
          dataEntry.video_typeid === 100
            ? "Live"
            : dataEntry.ondemand_selections
              ? "On-Demand"
              : "Scheduled"
      }));
    } else {
      mappedData = this.props.data.map(dataEntry => ({
        title: dataEntry.video_title_long,
        category: this.props.mapCategory(dataEntry.video_category),
        level: dataEntry.video_level,
        provider: dataEntry.providername,
        views: dataEntry.views,
        count: dataEntry.count,
        avg: (dataEntry.count / dataEntry.views).toFixed(2)
      }));
    }
    const xls = new XlsExport(mappedData, "Stats report");
    xls.exportToXLS("stats_export.xls");
  };

  orderBy = attr => {
    let order = "asc";
    if (this.state.orderDirection === "asc") {
      order = "desc";
    }
    this.setState({ orderBy: attr, orderDirection: order });
    this.props.sortByAttr(attr);
  };

  render() {
    const {
      orderBy,
      orderDirection,
      class_report_attr,
      schedule_report_attr
    } = this.state;

    let report = null;
    const exportVar = (
      <Button style={{ marginLeft: "auto" }} onClick={this.exportData}>
        EXPORT <ExportArrow style={{ marginLeft: 15 }} />
      </Button>
    );
    if (this.props.report === "schedule_report") {
      report = (
        <Fragment>
          <h1>Schedule report</h1>
          <div className="flex export-wrapper">
            <p>
              This report shows each individual event with Wexer Count data if
              it is available.
            </p>
            {exportVar}
          </div>
          <div className="table-wrapper">
            <Table>
              <TableHead>
                <TableRow>
                  {schedule_report_attr.map((attr, index) => (
                    <TableCell
                      onClick={() => this.orderBy(attr.value)}
                      numeric={attr.value === "count"}
                      key={`h_${attr.value}_${index}`}
                    >
                      <TableSortLabel
                        direction={orderDirection}
                        active={orderBy === attr.value}
                      >
                        {attr.text}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.data.map((dataEntry, index) => (
                  <TableRow hover key={index}>
                    <TableCell>{dataEntry.video_title_long}</TableCell>
                    <TableCell>
                      {format(new Date(dataEntry.datostempel), "dddd Do MMMM")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(dataEntry.datostempel), "HH:mm")}
                    </TableCell>
                    <TableCell numeric>{dataEntry.count}</TableCell>
                    <TableCell>
                      {dataEntry.video_typeid === 100
                        ? "Live"
                        : dataEntry.ondemand_selections
                          ? "On-Demand"
                          : "Scheduled"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {this.props.data.length === 0 && (
              <SnackbarContent className="label" message="No results" />
            )}
          </div>
        </Fragment>
      );
    } else if (this.props.report === "class_report") {
      report = (
        <Fragment>
          <h1>Class title report </h1>
          <div className="flex export-wrapper">
            <p>
              This report shows the total number of views for each title within
              the selected timeframe.
            </p>
            {exportVar}
          </div>
          <div className="table-wrapper">
            <Table>
              <TableHead>
                <TableRow>
                  {class_report_attr.map(attr => (
                    <TableCell onClick={() => this.orderBy(attr.value)} key={`h2_${attr.value}`}>
                      <TableSortLabel
                        active={orderBy === attr.value}
                        direction={orderDirection}
                      >
                        {attr.text}
                        {attr.value === "count" && (
                          <Tooltip title="This number represents the data gathered by your Wexer Count unit(s)">
                            <Info className="small-svg" />
                          </Tooltip>
                        )}
                        {attr.value === "avg" && (
                          <Tooltip title="This number represents your count data divided by the number of plays recorded for each class">
                            <Info className="small-svg" />
                          </Tooltip>
                        )}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.data.map((dataEntry, index) => (
                  <TableRow hover key={`${index}_${dataEntry.indslagid}`}>
                    {class_report_attr.map(attr => (
                      <TableCell key={`${attr.value}`}>{dataEntry[attr.value]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {this.props.data.length === 0 && (
              <SnackbarContent className="label" message="No results" />
            )}
          </div>
        </Fragment>
      );
    }
    return <div className="full-width">{report}</div>;
  }
}
