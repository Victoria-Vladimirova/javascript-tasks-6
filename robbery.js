'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();

    var gang = JSON.parse(json);
    var daysOfWeek = {'ПН': 0, 'ВТ': 1, 'СР': 2, 'ЧТ': 3, 'ПТ': 4, 'СБ': 5, 'ВС': 6};
    var intervals = [];
    var pairs = [];

    function parseTimeToMinutes(string) {
        var dayOfWeek = daysOfWeek[string.substring(0, 2)];
        var hour = parseInt(string.substring(3, 5));
        var minutes = parseInt(string.substring(6, 8));
        var offset = parseInt(string.substring(8));

        return nextPositiveTime(dayOfWeek * 24 * 60 + hour * 60 + minutes - offset * 60);
    }

    var minutesInWeek = 7 * 24 * 60;

    function nextPositiveTime(time) {
        return (time + minutesInWeek) % minutesInWeek;
    }

    Object.keys(gang).forEach(function (person) {
        var times = gang[person];
        times.forEach(function (time) {
            var timeFrom = parseTimeToMinutes(time.from);
            var timeTo = parseTimeToMinutes(time.to);
            intervals.push({time: timeFrom, start: true});
            intervals.push({time: timeTo, start: false});
            pairs.push([timeFrom, timeTo]);
        });
    });

    Object.keys(daysOfWeek).forEach(function (dayOfWeek) {
        var timeBusyTo = parseTimeToMinutes(dayOfWeek + ' ' + workingHours.from);
        var timeBusyFrom = parseTimeToMinutes(dayOfWeek + ' ' + workingHours.to);

        if (timeBusyFrom > timeBusyTo) {
            timeBusyTo = (timeBusyTo + 24 * 60) % minutesInWeek;
        }
        intervals.push({time: timeBusyFrom, start: true});
        intervals.push({time: timeBusyTo, start: false});
        pairs.push([timeBusyFrom, timeBusyTo]);
    });

    function getCurrentOffsetInMinutes() {
        var currentDate = new Date();
        return nextPositiveTime(((currentDate.getDay() + 6) % 7) * 24 * 60 +
            currentDate.getHours() * 60 + currentDate.getMinutes() +
            currentDate.getTimezoneOffset());
    }

    var current = getCurrentOffsetInMinutes();

    intervals.sort(function (a, b) {
        a = nextPositiveTime(a.time - current);
        b = nextPositiveTime(b.time - current);

        return a - b;
    });

    var gangCount = pairs.reduce(function (acc, pair) {
        if ((current >= pair[0] && current <= pair[1] && pair[0] < pair[1]) ||
            (pair[0] > pair[1] && (current >= pair[0] || current <= pair[1]))) {
            return acc + 1;
        } else {
            return acc;
        }
    }, 0);
    var startTime = 0;
    var endTime = 0;
    var found = false;

    for (var i = 0; i < intervals.length * 2; i++) {
        var time = intervals[i % intervals.length];
        if (time.start) {
            gangCount++;
            if (gangCount === 1) {
                endTime = time.time;
                if (endTime - startTime >= minDuration) {
                    found = true;
                    break;
                }
            }
        } else {
            gangCount--;
            if (gangCount === 0) {
                startTime = time.time;
            }
        }
    }

    if (!found) {
        return null;
    }

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
