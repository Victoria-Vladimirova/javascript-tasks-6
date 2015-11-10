'use strict';

var common = require('./common');

module.exports = function () {
    return {

        // Здесь как-то хранится дата ;)
        weekTime: null,

        // А здесь часовой пояс
        timezone: 5,

        toStringWithLeadingZero: function (num) {
            num += '';
            if (num.length === 1) {
                num = '0' + num;
            }
            return num;
        },

        // Выводит дату в переданном формате
        format: function (pattern) {
            var timeOffset = this.weekTime + this.timezone * common.MINUTES_IN_HOUR;
            var dateParts = this.toDateParts(timeOffset);
            return pattern.replace('%DD', common.DAYS_OF_WEEK[dateParts[0]])
                .replace('%HH', this.toStringWithLeadingZero(dateParts[1]))
                .replace('%MM', this.toStringWithLeadingZero(dateParts[2]));
        },

        toDateParts: function (offset) {
            var day = Math.floor(offset / common.MINUTES_IN_DAY);
            var hours = Math.floor((offset % common.MINUTES_IN_DAY) / common.MINUTES_IN_HOUR);
            var minutes = offset % common.MINUTES_IN_HOUR;
            return [day, hours, minutes];
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            return 'До ограбления ' + this.toHumanReadable(common.nextPositiveTime(
                    this.weekTime - moment.weekTime));
        },

        toHumanReadable: function (minutes) {
            var dateParts = this.toDateParts(minutes);

            var male;
            var firstNonZeroPart;

            if (dateParts[0] > 0) {
                male = true;
                firstNonZeroPart = dateParts[0];
            } else if (dateParts[1] > 0) {
                male = true;
                firstNonZeroPart = dateParts[1];
            } else {
                male = false;
                firstNonZeroPart = dateParts[2];
            }
            return this.toHumanReadableLeft(male, firstNonZeroPart) + ' ' +
                this.toHumanReadableDays(dateParts[0]) +
                this.toHumanReadableHours(dateParts[1]) +
                this.toHumanReadableMinutes(dateParts[2]);
        },

        toHumanReadableDays: function (days) {
            switch (days) {
                case 0:
                    return '';
                case 1:
                    return '1 день ';
                case 2:
                case 3:
                case 4:
                    return days + ' дня ';
                case 5:
                case 6:
                    return days + ' дней ';
                default:
                    return days + ' дней ';
            }
        },

        toHumanReadableHours: function (hours) {
            if (hours === 0) {
                return '';
            } else if (hours === 1 || hours === 21) {
                return hours + ' час ';
            } else if ([2, 3, 4, 22, 23].indexOf(hours) >= 0) {
                return hours + ' часа ';
            } else {
                return hours + ' часов ';
            }
        },

        toHumanReadableMinutes: function (minutes) {
            var lowerDigit = minutes % 10;
            var teen = minutes >= 11 && minutes <= 14;
            if (minutes === 0) {
                return '';
            } else if (lowerDigit === 1 && !teen) {
                return minutes + ' минута ';
            } else if ([2, 3, 4].indexOf(lowerDigit) >= 0 && !teen) {
                return minutes + ' минуты ';
            } else {
                return minutes + ' минут ';
            }
        },

        toHumanReadableLeft: function (male, number) {
            if (number % 10 === 1 && number !== 11) {
                return male ? 'остался' : 'осталась';
            }
            return 'осталось';
        },

        set date(value) {
            if (typeof value === 'number') {
                this.weekTime = value;
            } else {
                var dateParts = common.parseTimeToMinutes(value);
                this.weekTime = dateParts[0];
                this.timezone = dateParts[1];
            }
        },

        get date() {
            return (this.weekTime + this.timezone * 60) % common.MINUTES_IN_WEEK;
        }

    };
};
