import React, { PureComponent } from "react";
import { Dialog, DialogContent, CircularProgress } from "@material-ui/core";

export default class LoadingModal extends PureComponent {
  render() {
    return (
      <Dialog open={this.props.open}>
        <DialogContent className="loading-modal-body">
          <p>Fetching data...</p>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }
}
