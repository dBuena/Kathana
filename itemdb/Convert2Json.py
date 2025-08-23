import pandas as pd
import json

# Read the Excel file
file_path = 'Kathana_itemdb.xlsx'
sheet_name = 'Sheet1'

# Load the data, skipping rows that contain headers repeated mid-sheet
# We'll manually specify the columns based on your format
columns = [
    "ID", "ItemName", "Description", "LimitRequirement", "ShopPrice", "SellPrice",
    "TaneyPrice", "MaxDurability", "iEffect1Param1", "iEffect1Param2", "ClassLimit",
    "iEffect3ID", "iEffect3Function", "iEffect3Duration", "iEffect3Param1", "iEffect3Param2",
    "iEffect4ID", "iEffect4Function", "iEffect4Duration", "iEffect4Param1", "iEffect4Param2",
    "iEffect5ID", "iEffect5Function", "iEffect5Duration", "iEffect5Param1", "iEffect5Param2"
]

# Read Excel without header assumption, then filter valid rows
df = pd.read_excel(file_path, sheet_name=sheet_name, dtype=str)  # Read everything as string to avoid issues

# Find rows where the first cell is numeric (i.e., valid data rows)
# We'll assume that valid rows have an ID (first column) that can be converted to integer
valid_rows = []
for _, row in df.iterrows():
    try:
        # Try converting ID to int; if successful, it's likely a data row
        int(row.iloc[0])
        valid_rows.append(row)
    except (ValueError, TypeError):
        continue  # Skip header or non-data rows

# Reconstruct DataFrame with valid rows
df_clean = pd.DataFrame(valid_rows, columns=df.columns[:len(columns)])  # Use only the first N columns
df_clean.columns = columns  # Assign proper column names

# Convert types
for col in ["ID", "LimitRequirement", "ShopPrice", "SellPrice", "TaneyPrice",
           "MaxDurability", "iEffect1Param1", "iEffect1Param2", "ClassLimit",
           "iEffect3ID", "iEffect3Function", "iEffect3Duration", "iEffect3Param1", "iEffect3Param2",
           "iEffect4ID", "iEffect4Function", "iEffect4Duration", "iEffect4Param1", "iEffect4Param2",
           "iEffect5ID", "iEffect5Function", "iEffect5Duration", "iEffect5Param1", "iEffect5Param2"]:
    df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0).astype(int)

# Replace NaN or null descriptions with empty string or keep as "null" if needed
df_clean["Description"] = df_clean["Description"].fillna("").astype(str)
df_clean["ItemName"] = df_clean["ItemName"].astype(str)

# Convert to list of dictionaries
items_list = df_clean.to_dict(orient='records')

# Save to JSON file
output_file = 'items.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(items_list, f, indent=2, ensure_ascii=False)

print(f"Successfully converted {len(items_list)} items to {output_file}")