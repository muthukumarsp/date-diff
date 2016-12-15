var prompt = require('./lib/prompt');

const DAY_INDEX = 0;
const MONTH_INDEX = 1;
const YEAR_INDEX = 2;

const DATE_VALIDATOR_REGEX = "^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)\d{2})$";


var monthToDaysMap = new Map();

monthToDaysMap.set(1, 31); // JAN
monthToDaysMap.set(2, 28);
monthToDaysMap.set(3, 31);
monthToDaysMap.set(4, 30);
monthToDaysMap.set(5, 31);
monthToDaysMap.set(6, 30);
monthToDaysMap.set(7, 31);
monthToDaysMap.set(8, 31);
monthToDaysMap.set(9, 30);
monthToDaysMap.set(10, 31);
monthToDaysMap.set(11, 30);
monthToDaysMap.set(12, 31); // DEC


/*
 if (year is not divisible by 4) then (it is a common year)
 else if (year is not divisible by 100) then (it is a leap year)
 else if (year is not divisible by 400) then (it is a common year)
 else (it is a leap year)

 https://en.wikipedia.org/wiki/Leap_year#Algorithm
 */

var isLeafYear = function (year) {

    if (year % 4) {
        return false
    } else if (year % 100) {
        return true;
    } else if (year % 400) {
        return false;
    } else {
        return true;
    }
};

//console.log(isLeafYear("isLeaf : 1000", 1000));
//console.log(isLeafYear("isLeaf : 1995", 1995));
//console.log(isLeafYear("isLeaf : 1900", 1900));
//console.log(isLeafYear("isLeaf : 2000", 2000));


var numberOfDaysInMonthByYear = function (month, year) {
    if (month === 2 && isLeafYear(year)) {
        return 29;
    } else {
        return monthToDaysMap.get(month);
    }
};

var isDatesValid = function(startDateArray, endDateArray){

    if( endDateArray[YEAR_INDEX] < startDateArray[YEAR_INDEX]){
        return false;
    }else if( endDateArray[YEAR_INDEX] === startDateArray[YEAR_INDEX] && endDateArray[MONTH_INDEX] < startDateArray[MONTH_INDEX] ){
        return false;
    }else if(endDateArray[YEAR_INDEX] === startDateArray[YEAR_INDEX] &&
        endDateArray[MONTH_INDEX] === startDateArray[MONTH_INDEX] &&
        endDateArray[DAY_INDEX] < startDateArray[DAY_INDEX]){
        return false;
    }else{
        return true;
    }
}
/*
 * find diff returns difference between two dates in number of days.
 * e.g  start date : 1/1/2010  and end date 2/1/2011 - returns 1;
 *  if start date is ahead of end date it returns -1;
 *  e.g. start date: 12/1/2010  and end date 1/1/2010   returns -1
 */
var findDiff = function (startDate, endDate) {
    var startDateArray = startDate.split('/').map(val => parseInt(val));
    //console.log(startDateArray);
    var endDateArray = endDate.split('/').map(val => parseInt(val));
    //console.log(endDateArray);
    var startYearDays = 0;
    var endYearDays = 0;
    var daysInFullYears = 0;

    if( !isDatesValid(startDateArray, endDateArray)){
        return -1;
    }
    // if the dates spread in two calendar years, handle here.
    //console.log( "Years diff count", (endDateArray[YEAR_INDEX] - startDateArray[YEAR_INDEX]));
    if ( (endDateArray[YEAR_INDEX] - startDateArray[YEAR_INDEX]) > 0) {
        // count days in start month;
        startYearDays = numberOfDaysInMonthByYear(startDateArray[MONTH_INDEX], startDateArray[YEAR_INDEX]) - startDateArray[DAY_INDEX];
        //console.log(" start month  day count" + startDateArray + " : ", startYearDays);

        // count days in remaining months
        for (var i = startDateArray[MONTH_INDEX] + 1; i <= 12; i++) {
            startYearDays += numberOfDaysInMonthByYear(i, startDateArray[YEAR_INDEX]);
        }
        //console.log(" start year  days count" + startDateArray + " : ", startYearDays);

        endYearDays = endDateArray[DAY_INDEX];
        //console.log(" end  month  days count" + endDateArray + " : ", endYearDays);

        // count days from Jan to MONTH_INDEX-1 months
        for (var i = 1; i < endDateArray[MONTH_INDEX]; i++) {
            endYearDays += numberOfDaysInMonthByYear(i, endDateArray[YEAR_INDEX]);
        }

        //console.log(" end year  days count from Jan to MONTH_INDEX-1 " + endDateArray + " : ", endYearDays);

        // Now, count the days in the whole year in between
        for (var i = startDateArray[YEAR_INDEX] + 1; i < endDateArray[YEAR_INDEX]; i++) {
            if (isLeafYear(i)) {
                //console.log("lear year : ", i);
                daysInFullYears += 366;
            } else {
                //console.log("common year : ", i);
                daysInFullYears += 365;
            }
        }
        return startYearDays + endYearDays + daysInFullYears;
    } else {
        // dates in same calendar year
        var startMonthDays = numberOfDaysInMonthByYear(startDateArray[MONTH_INDEX]) - startDateArray[DAY_INDEX];
        var endMonthDays = endDateArray[DAY_INDEX];
        var daysInFullMonths = 0;
        if (startDateArray[MONTH_INDEX] < endDateArray[MONTH_INDEX]) {
            for (var i = startDateArray[MONTH_INDEX] + 1; i < endDateArray[MONTH_INDEX]; i++) {
                daysInFullMonths += numberOfDaysInMonthByYear(i, startDateArray[YEAR_INDEX]);
                //console.log("startYear and endYear is Same. daysInFullYears:  ", daysInFullYears);
            }
            //console.log("startMonthDays : ", startMonthDays, " endMonthDays: ", endMonthDays, "daysInFullMonths ", daysInFullMonths);

            return startMonthDays + endMonthDays + daysInFullMonths;
        }
        else {
            // Dates fall in same month of the year
            //console.log(" Dates fall in same month of the year");
            return endDateArray[DAY_INDEX] - startDateArray[DAY_INDEX];
        }
    }
}



/* Test cases Given
 1. 02/06/1983 - 22/06/1983: 19 days
 2. 04/07/1984 - 25/12/1984: 173 days
 3. 03/01/1989 - 03/08/1983: 1979 days*/

//console.log(findDiff("02/06/1983", "22/06/1983"));
//console.log(findDiff("04/07/1984", "25/12/1984"));
//console.log(findDiff("03/08/1983", "03/01/1989"));


//console.log(findDiff("31/12/1988", "03/1/1989"));


// Same Date
//console.log(findDiff("03/08/1989", "03/08/1989"));

// Negative Dates
//console.log(findDiff("03/01/1989", "03/08/1983"));
//console.log(findDiff("03/09/1989", "03/08/1989"));
//console.log(findDiff("04/08/1989", "03/08/1989"));




// date regular expression :   /^\d{2}\/\d{2}\/\d{4}$/
 prompt.start();

 prompt.get([
 {
 name: 'startDate',
 validator: /^\d{2}\/\d{2}\/\d{4}$/,
 warning: 'Entered Date should match the DD/MM/YYYY format',
 empty: false
 },
 {
 name: 'endDate',
 validator: /^\d{2}\/\d{2}\/\d{4}$/,
 warning: 'Entered Date should match the DD/MM/YYYY format',
 empty: false
 }
 ], function (err, result) {
 //console.log('Command-line input received:');
 //console.log('  start Date: ' + result.startDate);
 //console.log('  end Date: ' + result.endDate);
 //console.log( "Number of Days from " + result.startDate + " to " + result.endDate +" = ", findDiff(result.startDate, result.endDate));
 // if(findDiff(result.startDate, result.endDate) < )
     var totalDays = findDiff(result.startDate, result.endDate) -1; /// findDiff returns diff in dates, we need full days. So subtract with 1;
     if( totalDays < 0){
         console.log( 'End date should fall after the start Date');
     }else{
         console.log( "Number of Days from " + result.startDate + " to " + result.endDate +" = ",totalDays);
     }
 });


