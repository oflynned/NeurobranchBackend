/**
 * Created by edmond.o.flynn on 13/07/2016.
 */
var dateId = document.getElementById("year");
var foundingYear = 2016;
var currentYear = new Date().getFullYear();

if(currentYear == foundingYear) {
    dateId.innerHTML = currentYear
} else {
    dateId.innerHTML = foundingYear + "-" +currentYear;
}