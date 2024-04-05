import random
import json

# Define parameters for generating fake temperature data
min_latitude = 25  # Minimum latitude
max_latitude = 49   # Maximum latitude
min_longitude = 67  # Minimum longitude
max_longitude = 125  # Maximum longitude
min_temperature = -10  # Minimum temperature in Celsius
max_temperature = 40   # Maximum temperature in Celsius
temperature_slope = 0.5  # Slope of temperature increase with latitude

# Generate fake temperature data
temperature_data = []
for latitude in range(min_latitude, max_latitude + 1):
    for longitude in range(min_longitude, max_longitude + 1):
        temperature = (latitude - min_latitude) * temperature_slope + random.uniform(min_temperature, max_temperature)
        temperature_data.append({"Longitude": longitude, "Latitude": latitude, "Temperature": temperature})

# Write temperature data to a JSON file
with open("fake_temperature_data.json", "w") as json_file:
    json.dump(temperature_data, json_file, indent=4)

print("Fake temperature data generated and saved to 'fake_temperature_data.json'.")
