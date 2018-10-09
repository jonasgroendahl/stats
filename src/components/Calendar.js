import React, { PureComponent } from "react";
import { Calendar } from "fullcalendar";
import "../../node_modules/fullcalendar/dist/fullcalendar.min.css";
import { format, addSeconds } from "date-fns";

const styles = {
  selected: {
    color: "var(--wteal)"
  }
};

export default class CalendarComponent extends PureComponent {
  componentDidMount() {
    this.createCalendar();
    this.first = false;
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.data.length !== this.props.data.length ||
      prevProps.start_date !== this.props.start_date
    ) {
      console.log("New events!", this.props.start_date);
      this.calendar.gotoDate(this.props.start_date);
      this.calendar.refetchEvents();
    }
  }

  createCalendar = () => {
    const div = document.querySelector("#calendar");
    const options = {
      defaultView: "agendaWeek",
      allDaySlot: false,
      height: "parent",
      events: this.fetchData,
      slotDuration: "00:15:00",
      minTime: "06:00:00",
      maxTime: "24:00:00",
      header: false,
      firstDay: 1,
      eventRender: (event, element) => {
        const span = document.createElement("span");
        span.style.float = "right";
        span.style.margin = "2px";
        const strong = document.createElement("div");
        strong.classList.add("badge");
        strong.innerHTML = event.count;
        span.appendChild(strong);
        if (event.count <= 0) {
          element.classList.add("low");
        } else if (event.count >= 0 && event.count <= 10) {
          element.classList.add("med");
        } else if (event.count >= 11 && event.count <= 15) {
          element.classList.add("med-high");
        } else if (event.count >= 16 && event.count <= 20) {
          element.classList.add("high");
        } else {
          element.classList.add("v-high");
        }
        element.querySelector(".fc-time").appendChild(span);
      },
      viewRender: view => {
        console.log(
          "Changed the view!",
          view,
          view.start.format("YYYY-MM-DD"),
          view.end.format("YYYY-MM-DD")
        );
        if (this.first) {
          this.props.setInterval(view.start.toDate(), view.end.toDate());
        }
        this.first = true;
      }
    };
    this.calendar = new Calendar(div, options);
    this.calendar.render();
  };

  fetchData = (start, end, _, callback) => {
    const mappedData = this.props.data.map(data => {
      const start = format(new Date(data.datostempel), "YYYY-MM-DD HH:mm:ss");
      const end = format(
        addSeconds(new Date(data.datostempel), data.video_duration_sec),
        "YYYY-MM-DD HH:mm:ss"
      );
      return {
        start,
        end,
        title: data.video_title_long,
        video_id: data.indslagid,
        count: data.count
      };
    });
    console.log(mappedData);
    callback(mappedData);
  };

  render() {
    return (
      <div className="calendar-wrapper">
        <div className="calendar-color-box">
          <span className="text--gray">Key:</span>
          <div className="low">0-5</div>
          <div className="med">6-10</div>
          <div className="med-high">11-15</div>
          <div className="high">16-20</div>
          <div className="v-high">20+</div>
        </div>
        <div id="calendar" />
      </div>
    );
  }
}
