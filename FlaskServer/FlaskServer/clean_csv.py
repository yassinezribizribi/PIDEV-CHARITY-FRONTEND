import pandas as pd
import re

def clean_csv(input_file, output_file):
    """
    Clean a CSV file by:
    1. Removing trailing semicolons
    2. Removing wrapping double quotes
    3. Ensuring proper comma separation
    """
    try:
        # Read the raw file
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Clean each line
        cleaned_lines = []
        for line in lines:
            # Remove trailing semicolon
            line = line.rstrip(';\n')
            # Remove wrapping quotes
            line = line.strip('"')
            # Add back newline
            line = line + '\n'
            cleaned_lines.append(line)

        # Write cleaned data
        with open(output_file, 'w', encoding='utf-8') as f:
            f.writelines(cleaned_lines)

        # Verify the cleaned file can be read by pandas
        df = pd.read_csv(output_file)
        print(f"Successfully cleaned CSV file. Shape: {df.shape}")
        print("\nFirst few rows:")
        print(df.head())
        print("\nColumns:")
        print(df.columns.tolist())

    except Exception as e:
        print(f"Error cleaning CSV file: {str(e)}")

if __name__ == "__main__":
    input_file = "data1.csv"
    output_file = "data1_clean.csv"
    clean_csv(input_file, output_file) 