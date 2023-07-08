# Spot-the-Station-RSS-feed-to-Google-Calendar
This Apps Script can be used to fetch a RSS feed from Spot the Station and add the upcoming events to your Google Calendar of choice.


Set up a trigger in Apps Script to run extractSpotTheStationInfo() at regular intervals. I suggest weekly.

The script will fetch the feedUrl you define. This can be found at https://spotthestation.nasa.gov/.
Example = https://spotthestation.nasa.gov/sightings/xml_files/United_Kingdom_England_London.xml

Yech item on the feed is looped over and the description is split into key/value pairs.

The time in the description is used to check whether the event has passed already, if so, that event is ignored.

Future events are added to an array with the following available data:
"Title"
"Event Start"
"Event End"
"Date"
"Time"
"Duration"
"Maximum Elevation"
"Approach"
"Departure"

A counter is provided (commented out) to limit how many future events are added to the array. To use it, un-comment:

  //var counter = 0;

&

    //counter++;
    //if (counter === 2) {
    //  break; // Break out of the loop
    //}


The array is then sent to the next function to be added to the calendar, and when finished, a separate function is called to update a log stored in scriptProperties. This log keeps track of events that have been added to the calendar and events older than 2 months are removed automatically.

Be sure to set your calendar ID inside the addEventsToCalendar() function:
Example = "your-calendar-id@group.calendar.google.com";
