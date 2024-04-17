import pandas as pd
from datetime import datetime, timedelta
import json
import os


# THIS TAKES AROUND 5 MINUTES TO RUN: PLAN ACCORDINGLY

def month_str_to_num(month):
    return datetime.strptime(month, '%b').month


if __name__ == "__main__":
    print("SELECT WHICH TYPE OF DATA YOU WANT TO ADD")
    print("(1) Temperature (F)")
    print("(2) Dew Point (F)")
    print("(3) Humidity (%)")
    print("(4) Wind Speed (mph)")
    print("(5) Pressure (in)")
    
    selection = int(input("Enter the number of the data you want to add: "))
    if selection == 1:
        selection = "Temperature (F)"
    elif selection == 2:
        selection = "Dew Point (F)"
    elif selection == 3:
        selection = "Humidity (%)"
    elif selection == 4:
        selection = "Wind Speed (mph)"
    elif selection == 5:
        selection = "Pressure (in)"
    
    if type(selection) == int:
        print("Invalid selection")
        exit()

    filename = "updated_weather.csv"
    df = pd.read_csv(filename)

    groupData = df.groupby(["Month", "Day"])

    for (month, day), group in groupData:

        thisDay = []

        for index, row in group.iterrows():
            date = datetime(2008, month_str_to_num(month), day)

            location_df = df[df["Location"] == row["Location"]]
            info = []
            x = 0
            for i in range(1, 8):
                prev = date - timedelta(days=i)
                m, d = prev.strftime('%b'), prev.day
                data = location_df[(location_df["Month"] == m) & (location_df["Day"] == d)]
                dataValue = data[selection].values[0] if len(data) > 0 else 0
                info.append({
                    "x": x,
                    "y": dataValue
                })
                x += 1

            info.reverse()

            thisDay.append({
                "Location": row["Location"],
                "Longitude": row["Longitude"],
                "Latitude": row["Latitude"],
                "data": row[selection],
                "LastWeek": info
            })

        directory = None
        if selection == "Temperature (F)":
            directory = "./temperature_data"
        elif selection == "Dew Point (F)": 
            directory = "./dewpoint_data"
        elif selection == "Humidity (%)":
            directory = "./humidity_data"
        elif selection == "Wind Speed (mph)":
            directory = "./windspeed_data"
        elif selection == "Pressure (in)":
            directory = "./pressure_data"

        if not os.path.exists(directory):
            os.makedirs(directory)
        

        filename = "{}/{}{}.json".format(directory, month, day)

        with open(filename, "w") as outfile:
            json.dump(thisDay, outfile, indent=4)
