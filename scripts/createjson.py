import pandas as pd
from datetime import datetime, timedelta
import json
import os


# THIS TAKES AROUND 5 MINUTES TO RUN: PLAN ACCORDINGLY

def month_str_to_num(month):
    return datetime.strptime(month, '%b').month


if __name__ == "__main__":
    # print("SELECT WHICH TYPE OF DATA YOU WANT TO ADD")
    # print("(1) Temperature (F)")
    # print("(2) Dew Point (F)")
    # print("(3) Humidity (%)")
    # print("(4) Wind Speed (mph)")
    # print("(5) Pressure (in)")
    
    # selection = int(input("Enter the number of the data you want to add: "))
    # if selection == 1:
    #     selection = "Temperature (F)"
    # elif selection == 2:
    #     selection = "Dew Point (F)"
    # elif selection == 3:
    #     selection = "Humidity (%)"
    # elif selection == 4:
    #     selection = "Wind Speed (mph)"
    # elif selection == 5:
    #     selection = "Pressure (in)"
    
    # if type(selection) == int:
    #     print("Invalid selection")
    #     exit()

    filename = "updated_weather.csv"
    df = pd.read_csv(filename)

    groupData = df.groupby(["Month", "Day"])

    for (month, day), group in groupData:

        thisDay = []

        for index, row in group.iterrows():
            date = datetime(2008, month_str_to_num(month), day)
            location_df = df[df["Location"] == row["Location"]]

            lw_temp = []
            lw_dp = []
            lw_hum = []
            lw_ws = []
            lw_ps = []

            x = 0
            for i in range(1, 8):
                prev = date - timedelta(days=i)
                m, d = prev.strftime('%b'), prev.day
                data = location_df[(location_df["Month"] == m) & (location_df["Day"] == d)]

                tempValue = data["Temperature (F)"].values[0] if len(data) > 0 else 0
                dpValue = data["Dew Point (F)"].values[0] if len(data) > 0 else 0
                humValue = data["Humidity (%)"].values[0] if len(data) > 0 else 0
                wsValue = data["Wind Speed (mph)"].values[0] if len(data) > 0 else 0
                psValue = data["Pressure (in)"].values[0] if len(data) > 0 else 0

                lw_temp.append({
                    "x": x,
                    "y": tempValue
                })

                lw_dp.append({
                    "x": x,
                    "y": dpValue
                })

                lw_hum.append({
                    "x": x,
                    "y": humValue
                })

                lw_ws.append({
                    "x": x,
                    "y": wsValue
                })

                lw_ps.append({
                    "x": x,
                    "y": psValue
                })

                x += 1

            lw_temp.reverse()
            lw_dp.reverse()
            lw_hum.reverse()
            lw_ws.reverse()
            lw_ps.reverse()

            thisDay.append({
                "Location": row["Location"],
                "Name": row["Airport_Name"],
                "Longitude": row["Longitude"],
                "Latitude": row["Latitude"],
                "Temperature": row["Temperature (F)"],
                "DewPoint": row["Dew Point (F)"],
                "Humidity": row["Humidity (%)"],
                "WindSpeed": row["Wind Speed (mph)"],
                "Pressure": row["Pressure (in)"],
                "LastWeekTemperature": lw_temp,
                "LastWeekDewPoint": lw_dp,
                "LastWeekHumidity": lw_hum,
                "LastWeekWindSpeed": lw_ws,
                "LastWeekPressure": lw_ps
            })

        directory = "./weatherdata/"

        if not os.path.exists(directory):
            os.makedirs(directory)

        filename = "{}/{}{}.json".format(directory, month, day)

        with open(filename, "w") as outfile:
            json.dump(thisDay, outfile, indent=4)
