import React, { PureComponent } from 'react'
import { Calendar } from "fullcalendar";
import '../../node_modules/fullcalendar/dist/fullcalendar.min.css';

export default class CalendarComponent extends PureComponent {

    componentDidMount() {
        const div = document.querySelector("#calendar");
        const options = {
            defaultView: 'agendaWeek',
            allDaySlot: false,
            height: "parent",
            events: [{ start: '2018-08-19 14:00:00', end: '2018-08-19 15:00:00', title: 'Body Pump', views: 4 }],
            eventRender: (event, element) => {
                const span = document.createElement('span');
                span.style.float = 'right';
                span.style.margin = '2px';
                span.innerHTML = event.views;
                element.querySelector('.fc-time').appendChild(span);
            }
        }
        this.calendar = new Calendar(div, options);
        this.calendar.render();
    }

    render() {
        return (
            <div className="calendar-wrapper">
                <div id="calendar" />
            </div>
        )
    }
}
