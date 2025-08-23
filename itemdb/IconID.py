import pandas as pd
import json

# Define file paths
excel_file = 'Kathana_IconID.xlsx'
output_json = 'IconID.json'

# Read the Excel file
sheet_name = 'Sheet1'  # Adjust if your sheet has a different name
df = pd.read_excel(excel_file, sheet_name=sheet_name, engine='openpyxl')

# Clean up column names (remove any leading/trailing whitespace)
df.columns = df.columns.str.strip()

# Ensure required columns exist
if 'TEX_ID' not in df.columns or 'FILENAME' not in df.columns:
    raise ValueError("Excel file must contain columns: 'TEX_ID' and 'FILENAME'")

# Convert to list of dictionaries
icon_data = df.to_dict(orient='records')

# Write to JSON file
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(icon_data, f, indent=4, ensure_ascii=False)

print(f"Successfully converted '{excel_file}' to '{output_json}'")