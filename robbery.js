'use strict';

var moment = require('./moment');

var DAYS_OF_WEEK = {'ПН': 0, 'ВТ': 1, 'СР': 2, 'ЧТ': 3, 'ПТ': 4, 'СБ': 5, 'ВС': 6};
var MINUTES_IN_HOUR = 60;
var MINUTES_IN_DAY = 1440;
var MINUTES_IN_WEEK = 10080;
var DAYS_IN_WEEK = 7;

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {

    var gang = JSON.parse(json);
    var timepoints = [];
    var intervals = [];

    function parseTimeToMinutes(string) {
        var dayOfWeek = DAYS_OF_WEEK[string.substring(0, 2)];
        var hour = parseInt(string.substring(3, 5));
        var minutes = parseInt(string.substring(6, 8));
        var offset = parseInt(string.substring(8));

        return nextPositiveTime(dayOfWeek * MINUTES_IN_DAY + hour * MINUTES_IN_HOUR + minutes -
            offset * MINUTES_IN_HOUR);
    }

    function nextPositiveTime(time) {
        return (time + MINUTES_IN_WEEK) % MINUTES_IN_WEEK;
    }

    Object.keys(gang).forEach(function (person) {
        var times = gang[person];
        times.forEach(function (time) {
            var timeFrom = parseTimeToMinutes(time.from);
            var timeTo = parseTimeToMinutes(time.to);
            timepoints.push({time: timeFrom, start: true});
            timepoints.push({time: timeTo, start: false});
            intervals.push([timeFrom, timeTo]);
        });
    });

    Object.keys(DAYS_OF_WEEK).forEach(function (dayOfWeek) {
        var timeBusyTo = parseTimeToMinutes(dayOfWeek + ' ' + workingHours.from);
        var timeBusyFrom = parseTimeToMinutes(dayOfWeek + ' ' + workingHours.to);

        if (timeBusyFrom > timeBusyTo) {
            timeBusyTo = (timeBusyTo + MINUTES_IN_DAY) % MINUTES_IN_WEEK;
        }
        timepoints.push({time: timeBusyFrom, start: true});
        timepoints.push({time: timeBusyTo, start: false});
        intervals.push([timeBusyFrom, timeBusyTo]);
    });

    function getCurrentOffsetInMinutes() {
        var currentDate = new Date();
        return nextPositiveTime(((currentDate.getDay() + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK) *
            MINUTES_IN_DAY + currentDate.getHours() * MINUTES_IN_HOUR + currentDate.getMinutes() +
            currentDate.getTimezoneOffset());
    }

    var current = getCurrentOffsetInMinutes();

    timepoints.sort(function (a, b) {
        return nextPositiveTime(a.time - current) - nextPositiveTime(b.time - current);
    });

    var gangCount = intervals.reduce(function (acc, interval) {
        if ((interval[0] < interval[1] && current >= interval[0] && current <= interval[1]) ||
            (interval[0] > interval[1] && (current >= interval[0] || current <= interval[1]))) {
            return acc + 1;
        } else {
            return acc;
        }
    }, 0);

    var startTime = 0;
    var endTime = 0;
    var found = false;

    for (var i = 0; i < timepoints.length * 2; i++) {
        var timepoint = timepoints[i % timepoints.length];
        if (timepoint.start) {
            gangCount++;
            if (gangCount === 1) {
                endTime = timepoint.time;
                if (endTime - startTime >= minDuration) {
                    found = true;
                    break;
                }
            }
        } else {
            gangCount--;
            if (gangCount === 0) {
                startTime = timepoint.time;
            }
        }
    }

    if (!found) {
        return null;
    }

    var appropriateMoment = moment();
    appropriateMoment.date = startTime;
    appropriateMoment.timezone = 5;
    return appropriateMoment;
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};
