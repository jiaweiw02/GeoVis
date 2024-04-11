import pandas as pd
from datetime import datetime, timedelta
import json


# THIS TAKES AROUND 5 MINUTES TO RUN: PLAN ACCORDINGLY

def month_str_to_num(month):
    return datetime.strptime(month, '%b').month


if __name__ == "__main__":
    filename = "updated_weather.csv"
    df = pd.read_csv(filename)

    groupData = df.groupby(["Month", "Day"])

    monthsDone = set()

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
                WSdata = location_df[(location_df["Month"] == m) & (location_df["Day"] == d)]
                windSpeed = WSdata["Wind Speed (mph)"].values[0] if len(WSdata) > 0 else 0
                info.append({
                    "x": x,
                    "y": windSpeed
                })
                x += 1

            info.reverse()

            thisDay.append({
                "Location": row["Location"],
                "Longitude": row["Longitude"],
                "Latitude": row["Latitude"],
                "WS": row["Wind Speed (mph)"],
                "LastWeek": info
            })

        filename = "./weatherdata/{}{}.json".format(month, day)

        with open(filename, "w") as outfile:
            json.dump(thisDay, outfile, indent=4)
