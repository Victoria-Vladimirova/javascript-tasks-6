exports.MINUTES_IN_HOUR = 60;
exports.MINUTES_IN_DAY = 1440;
exports.MINUTES_IN_WEEK = 10080;
exports.DAYS_OF_WEEK = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

exports.nextPositiveTime = function (time) {
    return (time + exports.MINUTES_IN_WEEK) % exports.MINUTES_IN_WEEK;
};

exports.parseTimeToMinutes = function (string) {
    var minutes = exports.DAYS_OF_WEEK.indexOf(string.substring(0, 2)) *
        exports.MINUTES_IN_DAY + parseInt(string.substring(3, 5)) *
        exports.MINUTES_IN_HOUR + parseInt(string.substring(6, 8));

    var timezone = parseInt(string.substring(8));
    if (isNaN(timezone)) {
        timezone = 5;
    }

    return [exports.nextPositiveTime(minutes - timezone * exports.MINUTES_IN_HOUR), timezone];
};




