# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

from flask import Blueprint

from tarbell.app import TEMPLATE_TYPES

# HACK: Work around CSS being removed from template rendering in 
# https://github.com/newsapps/flask-tarbell/commit/cb1862007ca1a51255faedd0274dd9bbc27f1c75
# See also https://github.com/newsapps/flask-tarbell/issues/231
#
# The right way to handle this would be to use a real CSS preprocessor like
# LESS instead of concatenating CSS using Jinja.
TEMPLATE_TYPES.append("text/css")

blueprint = Blueprint('cook_convictions', __name__)

@blueprint.app_template_filter('format_stat')
def format_stat(fmt, val):
   return fmt.format(int(val))

# Short project name
NAME = "cook-convictions"

# Descriptive title of project
TITLE = "Convicted in Cook"

# Google spreadsheet key
SPREADSHEET_KEY = "11q1h1ft59mVZbUWMqIiWN4nUh1tQA7rZYxMaU0NcXS0"

# Exclude these files from publication
EXCLUDES = ["*.md", "requirements.txt"]

# Create JSON data at ./data.json, disabled by default
CREATE_JSON = True

# S3 bucket configuration
S3_BUCKETS = {
    # Provide target -> s3 url pairs, such as:
    #     "mytarget": "mys3url.bucket.url/some/path"
    # then use tarbell publish mytarget to publish to it
    "production": "convictions.smartchicagoapps.org",
}

# Default template variables
DEFAULT_CONTEXT = {
    'name': NAME, 
    'title': TITLE, 
}

SPREADSHEET_CACHE_TTL = 60
