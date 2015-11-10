'use strict';

var moment = require('./moment');
var common = require('./common');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {

    var gang = JSON.parse(json);
    var timepoints = [];
    var intervals = [];

    Object.keys(gang).forEach(function (person) {
        var times = gang[person];
        times.forEach(function (time) {
            var timeFrom = common.parseTimeToMinutes(time.from)[0];
            var timeTo = common.parseTimeToMinutes(time.to)[0];
            timepoints.push({time: timeFrom, start: true});
            timepoints.push({time: timeTo, start: false});
            intervals.push([timeFrom, timeTo]);
        });
    });

    common.DAYS_OF_WEEK.forEach(function (dayOfWeek) {
        var timeBusyTo = common.parseTimeToMinutes(dayOfWeek + ' ' + workingHours.from)[0];
        var timeBusyFrom = common.parseTimeToMinutes(dayOfWeek + ' ' + workingHours.to)[0];

        if (timeBusyFrom > timeBusyTo) {
            timeBusyTo = (timeBusyTo + common.MINUTES_IN_DAY) % common.MINUTES_IN_WEEK;
        }
        timepoints.push({time: timeBusyFrom, start: true});
        timepoints.push({time: timeBusyTo, start: false});
        intervals.push([timeBusyFrom, timeBusyTo]);
    });

    timepoints.sort(function (a, b) {
        return a.time - b.time;
    });

    var currentBusyCount = intervals.reduce(function (acc, interval) {
        return acc + (interval[0] > interval[1] ? 1 : 0);
    }, 0);

    var startTime = 0;
    var endTime = 0;
    var found = false;

    for (var i = 0; i < timepoints.length; i++) {
        var timepoint = timepoints[i];
        if (timepoint.start) {
            currentBusyCount++;
            if (currentBusyCount === 1) {
                endTime = timepoint.time;
                if (endTime - startTime >= minDuration) {
                    found = true;
                    break;
                }
            }
        } else {
            currentBusyCount--;
            if (currentBusyCount === 0) {
                startTime = timepoint.time;
            }
        }
    }

    if (!found) {
        return null;
    }

    var appropriateMoment = moment();
    appropriateMoment.date = startTime;
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
