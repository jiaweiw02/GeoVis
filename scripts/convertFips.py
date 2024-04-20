import csv

def county_id_to_fips(county_id):
    # Assuming county_id format is AB-123, where AB is state code and 123 is county code
    state_code, county_code = county_id.split('-')
    
    # Define a mapping of state codes to FIPS state codes
    state_fips_mapping = {
        'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06', 'CO': '08', 'CT': '09', 'DE': '10', 'FL': '12',
        'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19', 'KS': '20', 'KY': '21', 'LA': '22',
        'ME': '23', 'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28', 'MO': '29', 'MT': '30', 'NE': '31',
        'NV': '32', 'NH': '33', 'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38', 'OH': '39', 'OK': '40',
        'OR': '41', 'PA': '42', 'RI': '44', 'SC': '45', 'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50',
        'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55', 'WY': '56'
    }
    
    # Convert state code to FIPS state code
    fips_state_code = state_fips_mapping[state_code]
    
    # Convert county code to FIPS county code (assuming it's already in the correct format)
    fips_county_code = county_code
    
    # Combine state and county codes to get FIPS code
    fips_code = fips_state_code + fips_county_code
    
    return fips_code

def convert_county_ids(csv_file, output_csv_file):
    with open(csv_file, 'r') as infile, open(output_csv_file, 'w', newline='') as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        # ID,Name,State,Value,Anomaly (1901-2000 base period),Rank,1901-2000 Mean
        writer.writerow(['ID','Name','State','Value','Anomaly (1901-2000 base period)','Rank,1901-2000 Mean'])
        
        for i, row in enumerate(reader):
            if i != 0:
                county_id = row[0]  # Assuming county ID is in the first column
                fips_code = county_id_to_fips(county_id)
                row[0] = fips_code
                writer.writerow(row)
            

# running
months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
for mon in months:    
    input_csv_file = 'scripts/mapdata/oldPrec/'+mon+'Prec.csv'
    output_csv_file = 'scripts/mapdata/'+mon+'Prec.csv'
    convert_county_ids(input_csv_file, output_csv_file)
