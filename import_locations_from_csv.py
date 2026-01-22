#!/usr/bin/env python3
"""
Import locations from CSV file and generate all-locations.json

Usage:
    1. Place your CSV file in import-data/locations.csv
    2. Run: python3 import_locations_from_csv.py
"""
import csv
import json
import re
import os
from collections import defaultdict
from datetime import datetime

def slugify(name):
    """Convert name to URL-friendly slug"""
    slug = name.lower()
    
    # Replace special characters
    replacements = {
        'à': 'a', 'á': 'a', 'â': 'a', 'ä': 'a',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
        'ï': 'i', 'î': 'i', 'ì': 'i', 'í': 'i',
        'ô': 'o', 'ö': 'o', 'ò': 'o', 'ó': 'o',
        'ü': 'u', 'û': 'u', 'ù': 'u', 'ú': 'u',
        'ç': 'c', 'ñ': 'n'
    }
    
    for old, new in replacements.items():
        slug = slug.replace(old, new)
    
    # Replace non-alphanumeric with hyphens
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    
    return slug

def parse_csv(csv_path):
    """Parse CSV file and return structured data"""
    west_vl = []
    oost_vl = []
    
    # Map hoofdgemeente names to slugs
    slug_map = {}
    
    # Group locations by postal code to merge duplicates
    locations_by_key = defaultdict(lambda: {'postal_codes': []})
    
    print(f"📖 Reading CSV file: {csv_path}")
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        # Try tab-separated first
        sample = f.read(1024)
        f.seek(0)
        
        if '\t' in sample:
            reader = csv.DictReader(f, delimiter='\t')
        else:
            reader = csv.DictReader(f)
        
        for row in reader:
            # Handle different possible column names
            province = row.get('Provincie') or row.get('provincie') or row.get('Province')
            postal_code = row.get('Postcode') or row.get('postcode') or row.get('PostalCode')
            name = row.get('Naam') or row.get('naam') or row.get('Name') or row.get('plaats') or row.get('Plaats')
            loc_type = row.get('Type') or row.get('type')
            parent_group = row.get('Hoofdgemeente') or row.get('hoofdgemeente') or row.get('MainMunicipality')
            
            if not all([province, postal_code, name, loc_type, parent_group]):
                print(f"⚠️  Skipping incomplete row: {row}")
                continue
            
            # Determine slug and parent
            if loc_type == 'Hoofdgemeente':
                slug = slugify(name)
                slug_map[parent_group] = slug
                parent = None
            else:
                # Deelgemeente - find parent slug
                parent_slug = slug_map.get(parent_group)
                if not parent_slug:
                    # Try to derive from parent_group name
                    parent_slug = slugify(parent_group.split('-')[0])
                    slug_map[parent_group] = parent_slug
                
                slug = parent_slug
                parent = parent_group.title()
            
            # Create unique key for this location
            key = f"{province}|{slug}|{name}"
            
            # Add or update location
            if key not in locations_by_key:
                locations_by_key[key] = {
                    'province': province,
                    'name': name,
                    'slug': slug,
                    'parent': parent,
                    'postal_codes': []
                }
            
            # Add postal code if not already present
            if postal_code not in locations_by_key[key]['postal_codes']:
                locations_by_key[key]['postal_codes'].append(postal_code)
    
    # Convert to lists
    for key, loc in locations_by_key.items():
        location = {
            'name': loc['name'],
            'slug': loc['slug'],
            'postal_codes': sorted(loc['postal_codes']),
            'parent': loc['parent']
        }
        
        if loc['province'] == 'West-Vlaanderen':
            west_vl.append(location)
        else:
            oost_vl.append(location)
    
    # Sort by name
    west_vl.sort(key=lambda x: x['name'])
    oost_vl.sort(key=lambda x: x['name'])
    
    return {
        'west-vlaanderen': west_vl,
        'oost-vlaanderen': oost_vl
    }

def main():
    csv_path = 'import-data/locations.csv'
    output_path = 'public/data/all-locations.json'
    backup_path = f'public/data/all-locations.json.backup.{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    
    # Check if CSV exists
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        print(f"\n📝 Please create a CSV file at: {csv_path}")
        print(f"   Format: Provincie, Postcode, Naam, Type, Hoofdgemeente")
        return
    
    # Backup existing JSON
    if os.path.exists(output_path):
        print(f"💾 Creating backup: {backup_path}")
        os.system(f'cp "{output_path}" "{backup_path}"')
    
    # Parse CSV
    try:
        data = parse_csv(csv_path)
    except Exception as e:
        print(f"❌ Error parsing CSV: {e}")
        return
    
    # Write JSON
    print(f"\n📝 Writing JSON to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # Stats
    west_count = len(data['west-vlaanderen'])
    oost_count = len(data['oost-vlaanderen'])
    total = west_count + oost_count
    
    print(f"\n✅ Import complete!")
    print(f"   West-Vlaanderen: {west_count} locations")
    print(f"   Oost-Vlaanderen: {oost_count} locations")
    print(f"   Total: {total} locations")
    print(f"\n💡 Next steps:")
    print(f"   1. Review the generated JSON: {output_path}")
    print(f"   2. Run: rsync -av --delete public/ docs/")
    print(f"   3. Commit and push to GitHub")

if __name__ == '__main__':
    main()
