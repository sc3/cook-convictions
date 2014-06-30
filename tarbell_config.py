# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

# Short project name
NAME = "cook-convictions"

# Descriptive title of project
TITLE = "Conviction Data Project"

# Google spreadsheet key
SPREADSHEET_KEY = "11q1h1ft59mVZbUWMqIiWN4nUh1tQA7rZYxMaU0NcXS0"

# Exclude these files from publication
EXCLUDES = ["*.md", "requirements.txt"]

# Create JSON data at ./data.json, disabled by default
# CREATE_JSON = True

# S3 bucket configuration
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    #     "mytarget": "mys3url.bucket.url/some/path"
    # then use tarbell publish mytarget to publish to it
    "production": "<WHATEVER>/cook-convictions",
}

# Default template variables
DEFAULT_CONTEXT = {
    'name': 'cook-convictions',
    'title': 'Conviction Data Project'
}