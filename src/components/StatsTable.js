import React, { PureComponent } from 'react'
import {
    Button, Table,
    TableHead,
    TableCell,
    TableBody, TableRow
} from '@material-ui/core';
import { ImportExport } from "@material-ui/icons";
import { format } from 'date-fns';


export default class StatsTable extends PureComponent {
    render() {
        return (
            <div className="full-width">
                <h1>Schedule report</h1>
                <div className="flex">
                    <p>This report shows each individual event with Wexer Count data if it is available.</p>
                    <Button style={{ marginLeft: 'auto' }}>
                        EXPORT <ImportExport style={{ marginLeft: 15 }} />
                    </Button>
                </div>
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
                                <TableCell>{dataEntry.name}</TableCell>
                                <TableCell>{format(dataEntry.date, 'dddd Do MMMM')}</TableCell>
                                <TableCell>{format(dataEntry.date, 'HH:mm')}</TableCell>
                                <TableCell numeric>{dataEntry.views}</TableCell>
                                <TableCell>{dataEntry.type}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        )
    }
}
