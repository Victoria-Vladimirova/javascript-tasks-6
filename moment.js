'use strict';

var MINUTES_IN_HOUR = 60;
var MINUTES_IN_DAY = 1440;

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        weekTime: null,

        // А здесь часовой пояс
        timezone: -new Date().getTimezoneOffset() / MINUTES_IN_HOUR,

        toStringWithLeadingZero: function (num) {
            num += '';
            if (num.length === 1) {
                num = '0' + num;
            }
            return num;
        },

        // Выводит дату в переданном формате
        format: function (pattern) {
            var timeOffset = this.weekTime + this.timezone * MINUTES_IN_HOUR;
            var daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
            var day = daysOfWeek[Math.floor(timeOffset / MINUTES_IN_DAY)];
            var hours = Math.floor((timeOffset % MINUTES_IN_DAY) / MINUTES_IN_HOUR);
            var minutes = timeOffset % MINUTES_IN_HOUR;

            return pattern.replace('%DD', day).replace('%HH', this.toStringWithLeadingZero(hours))
                .replace('%MM', this.toStringWithLeadingZero(minutes));
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
        },

        set date(value) {
            this.weekTime = value;
        }

    };
};
