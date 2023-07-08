# Spot the Station RSS feed to Google Calendar

This Apps Script allows you to fetch an RSS feed from Spot the Station and add the upcoming events to your Google Calendar. The script is designed to run at regular intervals using a trigger in Apps Script.

Setup

1. Obtain the feed URL: Go to https://spotthestation.nasa.gov/ and find the RSS feed for your desired location. The feed URL will be in the format: https://spotthestation.nasa.gov/sightings/xml_files/[location].xml.
2. Create a new Apps Script project: Open the Apps Script editor (https://script.google.com/) and create a new project.
3. Copy the provided code: Replace the default code in the script editor with the code from the provided code.gs file.
4. Customize the script: In the extractSpotTheStationInfo function, update the feedUrl variable with your specific feed URL.
5. Set up a trigger: In the Apps Script editor, go to Edit > Current project's triggers. Click on the "Add Trigger" button and configure the trigger to run the extractSpotTheStationInfo function at the desired interval (e.g., weekly).

# Functionality
1. The script fetches the RSS feed based on the provided URL.
2. Each item in the feed is processed individually. The description of each item is split into key/value pairs for further processing.
3. The script checks the event time to determine if it has already passed. If an event has passed, it is ignored. Only future events are considered.
4. The relevant event data (such as title, start time, end time, date, duration, elevation, approach, and departure) is extracted and stored in an array.
5. The array of upcoming events is then passed to the addEventsToCalendar function to add the events to your Google Calendar. Note that you need to set your calendar ID within the addEventsToCalendar function.
6. After the events are added to the calendar, a separate function is called to update a log stored in scriptProperties. This log keeps track of events that have been added to the calendar, and events older than 2 months are automatically removed from the log.

# Notes
By default, all future events from the feed will be added to the calendar. If you want to limit the number of events added, you can uncomment the counter code provided and set the desired limit.
Remember to save the script and set up the trigger for regular execution.
Make sure your script has the necessary permissions to access the Calendar service.

Feel free to modify and adapt the code to suit your needs.

# Contributing
Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

Author
Staples1010
