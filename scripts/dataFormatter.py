import pandas as pd

if __name__ == "__main__":
    file = "weather.csv"
    file1 = "us-airports.csv"
    df = pd.read_csv(file)
    df1 = pd.read_csv(file1)

    codeToLongLat = {}

    # average temperature for each location
    for iata in df1["iata_code"].unique():
        # get the longitude and latitude of this airport
        if iata not in df1["iata_code"].values:
            continue
        long = df1[df1["iata_code"] == iata]["longitude_deg"].values[0]
        lat = df1[df1["iata_code"] == iata]["latitude_deg"].values[0]
        codeToLongLat[iata] = (long, lat)
    
    df['Longitude'] = df['Location'].map(lambda x: codeToLongLat.get(x, (None, None))[0])
    df['Latitude'] = df['Location'].map(lambda x: codeToLongLat.get(x, (None, None))[1])
    df['Airport_Name'] = df['Location'].map(lambda x: df1[df1["iata_code"] == x]["name"].values[0] if x in df1["iata_code"].values else None)

    weatherWithLongLat = "updated_weather.csv"
    df.to_csv(weatherWithLongLat, index=False)
    