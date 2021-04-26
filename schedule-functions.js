// Change the return value to simulate different days/times
function today() {
    var day = new Date();
    return day;
}

function updateCurrentTime() {
    var y = setInterval(function() {
        // Update the string that shows the current time
        var now = today();
        document.getElementById('weekday').innerHTML = "It is currently " + now.getHours() + ":" + now.getMinutes() + " on " + getWeekday() + ".";
    }, 1000);
}

// Get string representation of the current day
function getWeekday() {
    var d = today();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var n = weekday[d.getDay()];
    return n;
}

function setTableDay(day) 
{
    // Save current data before switching
    document.getElementById("timetable").setAttribute("curDay", day);

    var dayButtons = document.getElementsByName("weekdaybutton");
    for (var i = 0; i < dayButtons.length; i++) {
        // Set the selected day as "active" (change style to be filled in)
        if (dayButtons[i].innerHTML == day) {
            dayButtons[i].className = "button";
        }
        else {
            dayButtons[i].className = "button button1";
        }
    }

    loadStored(day);
}

function changeDay(day) {
    saveStored();
    setTableDay(day);
}

function saveAndReload() {
    saveStored();
    location.reload();
}

function saveStored() {
    day = document.getElementById("timetable").getAttribute("curDay");

    console.log("Hello?");
    var classes = "";
    var teachers = "";
    var links = "";

    var table = document.getElementById("timetable");
    var rows = table.getElementsByTagName("tr");

    for (var j = 1; j < rows.length; j++) {

        var cells = rows[j].children;

        classes += cells[2].innerHTML + ",";
        teachers += cells[3].innerHTML + ",";
        links += cells[4].innerHTML + ",";
    }

    localStorage.setItem(day + "teachers", teachers);
    localStorage.setItem(day + "classes", classes);
    localStorage.setItem(day + "links", links);
}

// Get an individual item from local storage
function getStored(cname) {

    if (localStorage.getItem(cname) != null) {
        return localStorage.getItem(cname);
    }
    // Return empty string if it hasn't been created yet
    return "";
  }

function loadStored(day) 
{
    // Load all data for current day from local storage
    var teachers = getStored(day + "teachers");
    var classes = getStored(day + "classes");
    var links = getStored(day + "links");

    teachers = teachers.split(",");
    classes = classes.split(",");
    links = links.split(",");

    var table = document.getElementById("timetable");
    var rows = table.getElementsByTagName("tr");

    // Populate table with data from local storage
    for (var j = 1; j < rows.length; j++) {

        var cells = rows[j].cells;

    
        // Classes
        if (classes[j-1] == undefined) {
            cells[2].innerHTML = "";
        }
        else { cells[2].innerHTML = classes[j-1]; }
        // Teachers
        if (teachers[j-1] == undefined) {
            cells[3].innerHTML = "";
        }
        else { cells[3].innerHTML = teachers[j-1]; }
        // Zoom links
        if (links[j-1] == undefined) {
            cells[4].innerHTML = "";
        }
        else { cells[4].innerHTML = links[j-1]; }
    }

    return classes;
}

function toggleEdit() {

    // Hide edit mode button
    document.getElementById("editbutton").style.display = "none";

    // Show button to save changes
    document.getElementById("savebutton").style.display = "block";

    // Show instructions for editing table
    document.getElementById("editmode").style.display = "block";

    var table = document.getElementById("timetable");
    
    for (var i = 1; i < table.rows.length; i++) {
        let row = table.rows[i]
        //iterate through rows
        //rows would be accessed using the "row" variable assigned in the for loop
        for (let j = 2; j < row.cells.length; j++) {
            let col = row.cells[j]
            col.contentEditable = true;
        }  
    }
}

function getListOfTimes() 
{
    var times = [];
    var hours = [8, 8, 9, 10, 11, 11, 12, 13, 13, 14, 15];
    var minutes = [30, 55, 20, 3, 2, 45, 28, 11, 54, 37, 20];

    for (var i = 0; i < hours.length; i++) {
        var date = today();
        date.setHours(hours[i]);
        date.setMinutes(minutes[i]);
        date.setSeconds(0);
        times.push(date);
    }
    return times;
}

function getNextClass() 
{
    day = getWeekday();
    // Assemble schedule data from local storage
    var teachers = getStored(day + "teachers");
    var classes = getStored(day + "classes");
    var links = getStored(day + "links");

    teachers = teachers.split(",");
    classes = classes.split(",");
    links = links.split(",");

    // Find next period w/ valid zoom link
    var periods = getListOfTimes();

    var now = today().getTime();
    for (var i = 0; i < periods.length; i++) {
        time = periods[i];
        var t = time.getTime();
        // If this period hasn't happened yet
        if (time - now > 0) {
            var str = links[i];
            if (str == undefined || !str.includes("zoom.us/")) {
                continue;
            }
            var nextClass = [];
            nextClass.push(time);
            nextClass.push(classes[i]);
            nextClass.push(teachers[i]);
            nextClass.push(links[i]);

            return nextClass;
        }
    }
}

function countdown() {
    // Set the date we're counting down to
    var next = getNextClass();

    if (next == undefined) {
        var infoString = "No more classes today! If you're missing a class, please add it in the schedule below.";
        document.getElementById("countdownintro").innerHTML = "";
        document.getElementById("countdown").innerHTML = infoString;
        return;
    }
    // Display class and teacher info, if it's available
    if (next[1] != "" && next[2] != "") {
        var infoString = "Your next class is " + next[1] + " with " + next[2] + ".";
        document.getElementById("classinfo").innerHTML = infoString;
    }
    var link = next[3];
    var countDownDate = next[0];
    countDownDate = countDownDate.getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get today's date and time
        var now = today().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        hours = hours.toLocaleString('en-US', {minimumIntegerDigits: 2});
        minutes = minutes.toLocaleString('en-US', {minimumIntegerDigits: 2});
        seconds = seconds.toLocaleString('en-US', {minimumIntegerDigits: 2});

        // Display the result in the element with id="demo"
        document.getElementById("countdown").innerHTML = hours + ":"
        + minutes + ":" + seconds;

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            window.open(link, "_blank");
            document.getElementById("countdown").innerHTML = "Zoom link opened";
            countdown();
        }
    }, 1000);
}