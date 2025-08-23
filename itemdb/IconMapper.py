import pandas as pd
import json

# Read the Excel file - assuming the sheet is named 'Sheet1'
file_path = 'Kathana_ItemIconMapping.xlsx'
sheet_name = 'Sheet1'

# Load the data, skipping rows that don't have proper structure
df = pd.read_excel(file_path, sheet_name=sheet_name, engine='openpyxl')

# Strip whitespace from column names
df.columns = df.columns.str.strip()

# Replace NaN in 'Name' with empty string or placeholder
df['Name'] = df['Name'].fillna('')

# Convert the DataFrame to a list of dictionaries
icon_map_list = df.to_dict(orient='records')

# Save as JSON
output_file = 'IconMap.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(icon_map_list, f, indent=4, ensure_ascii=False)

print(f"Successfully converted '{file_path}' to '{output_file}'")