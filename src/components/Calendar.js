import React, { PureComponent } from "react";
import { Calendar } from "fullcalendar";
import "../../node_modules/fullcalendar/dist/fullcalendar.min.css";
import { format, addSeconds } from "date-fns";

export default class CalendarComponent extends PureComponent {
  componentDidMount() {
    this.createCalendar();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.length !== this.props.data.length) {
      console.log("New events!");
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
      slotDuration: "00:05:00",
      eventRender: (event, element) => {
        const span = document.createElement("span");
        span.style.float = "right";
        span.style.margin = "2px";
        span.innerHTML = "COUNT: ";
        const strong = document.createElement("strong");
        strong.innerHTML = event.count;
        span.appendChild(strong);
        if (event.count == 0) {
          element.querySelector(".fc-bg").style.opacity = 0.5;
        } else if (event.count >= 0 && event.count <= 10) {
          element.querySelector(".fc-bg").style.opacity = 0.2;
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
        this.props.setInterval(view.start.toDate(), view.end.toDate());
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
        <div id="calendar" />
      </div>
    );
  }
}
