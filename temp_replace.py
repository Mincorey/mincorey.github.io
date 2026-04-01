import os, re

files_with_large = [
    r"d:\SOFT\Apsny-Nedviga\src\screens\SearchResultsScreen.tsx",
    r"d:\SOFT\Apsny-Nedviga\src\screens\PublicProfileScreen.tsx",
    r"d:\SOFT\Apsny-Nedviga\src\screens\ProfileScreen.tsx",
    r"d:\SOFT\Apsny-Nedviga\src\screens\PrivacySettingsScreen.tsx",
    r"d:\SOFT\Apsny-Nedviga\src\screens\MyListingsScreen.tsx",
    r"d:\SOFT\Apsny-Nedviga\src\screens\InboxScreen.tsx",
    r"d:\SOFT\Apsny-Nedviga\src\screens\HomeScreen.tsx",
    r"d:\SOFT\Apsny-Nedviga\src\screens\FavoritesScreen.tsx",
    r"d:\SOFT\Apsny-Nedviga\src\screens\AddListingScreen.tsx",
]

for fpath in files_with_large:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the tag
    content = re.sub(r'<ActivityIndicator\s+size="large"\s+color=\{[^\}]+\}\s*/>', '<AppLoader />', content)
    content = re.sub(r'<ActivityIndicator\s+size="large"\s+color="[^\"]+"\s*/>', '<AppLoader />', content)
    
    # Add import
    if 'import AppLoader' not in content:
        content = re.sub(r'(import React[^;]*;)', r"\1\nimport AppLoader from '../components/AppLoader';", content)
        
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
