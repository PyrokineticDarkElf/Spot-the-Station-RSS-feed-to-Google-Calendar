function extractSpotTheStationInfo() {
  var feedUrl = "https://spotthestation.nasa.gov/sightings/xml_files/United_Kingdom_England_London.xml"
  var feed = UrlFetchApp.fetch(feedUrl);
  var feedXml = feed.getContentText();
  var document = XmlService.parse(feedXml);
  var root = document.getRootElement();
  var channel = root.getChild("channel");
  var items = channel.getChildren("item");

  var currentDateTime = new Date();
  var events = [];
  
  //var counter = 0;

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var title = item.getChildText("title");
    var description = item.getChildText("description");

    // Extract the date from the title
    var dateStr = title.split(" ")[0];

    // Normalize the description by replacing "<br />" with "<br/>"
    description = description.replace("<br />", "<br/>");

    var infoLines = description.split("<br/>");
    var infoDict = {};

    for (var j = 0; j < infoLines.length; j++) {
      var line = infoLines[j];
      var colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        var key = line.slice(0, colonIndex).trim();
        var value = line.slice(colonIndex + 1).trim();
        infoDict[key] = value;
      }
    }

    // Convert date string to JavaScript Date object
    var eventDate = new Date(dateStr);

    // Convert time to 24-hour format
    var timeStr = infoDict["Time"];
    var hours = parseInt(timeStr.split(":")[0]);
    var minutes = parseInt(timeStr.split(":")[1].split(" ")[0]);
    var ampm = timeStr.split(":")[1].split(" ")[1];

    if (ampm === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    // Calculate event start and end times
    var eventStart = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      hours,
      minutes
    );

    var durationStr = infoDict["Duration"];
    var durationMinutes = parseInt(durationStr.match(/\d+/)[0]);

    // Check if the event crosses the midnight boundary
    var crossesMidnight = eventStart.getHours() + Math.floor(durationMinutes / 60) >= 24;

    // Calculate event end time
    var eventEnd = new Date(eventStart.getTime() + durationMinutes * 60000);
    if (crossesMidnight) {
        eventEnd.setDate(eventEnd.getDate() + 1); // Set the end date to the next day
    }
    
    // Exclude past events
    if (eventStart < currentDateTime) {
      continue;
    }

    //console.log("start" + eventStart);
    //console.log("duration" + durationMinutes);
    //console.log("end" + eventEnd);

    // Format event start and end times as ISO strings
    infoDict["Event Start"] = eventStart.toISOString();
    infoDict["Event End"] = eventEnd.toISOString();

    //console.log("clean start" + infoDict["Event Start"]);
    //console.log("clean end" + infoDict["Event End"]);
    //console.log("---------");

    // Add the extracted event data to the events array
    events.push({
      "Title": title,
      "Event Start": eventStart.getTime(),
      "Event End": eventEnd.getTime(),
      "Date": infoDict["Date"],
      "Time": infoDict["Time"],
      "Duration": infoDict["Duration"],
      "Maximum Elevation": infoDict["Maximum Elevation"],
      "Approach": infoDict["Approach"],
      "Departure": infoDict["Departure"],
    });
    
    // Increment the counter
    //counter++;
    //if (counter === 2) {
    //  break; // Break out of the loop
    //}
  }

  // Pass events to calendar event maker
  //console.log(events);
  addEventsToCalendar(events);
  removeOldTimestamps();
}

function addEventsToCalendar(events) {
  var calendarId = "your-calendar-id@group.calendar.google.com";

  // Access the calendar
  var calendar = CalendarApp.getCalendarById(calendarId);

  for (var i = 0; i < events.length; i++) {
    var event = events[i];

    var title = event["Title"];

    // Check if event is already added to the calendar
    if (isEventAddedToCalendar(event["Event Start"])) {
      //console.log("Event already added: " + event["Event Start"]);
      continue;
    }

    var eventStart = new Date(event["Event Start"]);
    var eventEnd = new Date(event["Event End"]);
    var description = "Date: " + event["Date"] + "\n" +
      "Time: " + event["Time"] + "\n" +
      "Duration: " + event["Duration"] + "\n" +
      "Maximum Elevation: " + event["Maximum Elevation"] + "\n" +
      "Approach: " + event["Approach"] + "\n" +
      "Departure: " + event["Departure"];

    var calTitle = "Spot The Station " + title;

    // Create the calendar event
    var calendarEvent = calendar.createEvent(calTitle, eventStart, eventEnd, {
      description: description
    });

    // Store the added event's timestamp
    storeEventTimestamp(eventStart);

    //console.log("Event added to the calendar: " + calendarEvent.getTitle());
  }
}

function isEventAddedToCalendar(eventStart) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var addedEvents = scriptProperties.getProperty("addedEvents");

  if (!addedEvents) {
    return false;
  }

  var addedEventsData = JSON.parse(addedEvents);
  for (var i = 0; i < addedEventsData.length; i++) {
    var eventData = addedEventsData[i];
    if (eventData.timestamp === eventStart) {
      return true;
    }
  }

  return false;
}

function storeEventTimestamp(eventStart) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var addedEvents = scriptProperties.getProperty("addedEvents");

  if (!addedEvents) {
    var addedEventsData = [];
  } else {
    var addedEventsData = JSON.parse(addedEvents);
  }

  // Check if the event is already added
  var isEventAdded = addedEventsData.some(function(eventData) {
    return eventData.timestamp === eventStart.getTime();
  });

  // If the event is already added, exit the function
  if (isEventAdded) {
    return;
  }

  // Add the event timestamp to the stored data
  addedEventsData.push({
    timestamp: eventStart.getTime()
  });

  // Store the updated data in the script properties
  scriptProperties.setProperty("addedEvents", JSON.stringify(addedEventsData));
}

function removeOldTimestamps() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var addedEvents = scriptProperties.getProperty("addedEvents");

  if (!addedEvents) {
    //console.log("No existing events in log");
    return;
  }

  var addedEventsData = JSON.parse(addedEvents);
  var currentDate = new Date();

  // Filter out timestamps older than 2 months
  addedEventsData = addedEventsData.filter(function(eventData) {
    var eventTimestamp = new Date(eventData.timestamp);
    var diffInMonths = (currentDate.getFullYear() - eventTimestamp.getFullYear()) * 12 + (currentDate.getMonth() - eventTimestamp.getMonth());
    return diffInMonths <= 2;
  });
  //console.log("cleanedEventsData" + addedEventsData );
  // Store the updated data in the script properties
  scriptProperties.setProperty("addedEvents", JSON.stringify(addedEventsData));
}

function getConfiguredFeedUrl() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty("feedUrl");
}
function getConfiguredCalendarId() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty("calendarId");
}
