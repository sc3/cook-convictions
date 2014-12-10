# -*- coding: utf-8 -*-

"""
Tarbell project configuration
"""

import json

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
def format_stat(val, fmt):
   return fmt.format(int(val))

@blueprint.app_template_filter('community_area_top_charge_json')
def community_area_top_charge_json(community_areas):
    data = [{
                'number': ca['number'],
                'top_charge': ca['top_charge'],
                'top_charge_count': ca['top_charge_count'],
                'top_charge_pct': '{:.0%}'.format(ca['top_charge_pct'])
            }
            for ca in community_areas]
    return json.dumps(data)

@blueprint.app_template_filter('drug_category_json')
def drug_category_json(data):
    transformed = []
    offense_types = set()
    for row in data:
        offense_types.add(row['offense_type'])

    for offense_type in list(offense_types):
        type_data = {
            'label': offense_type,
        }
        for row in data:
            if row['offense_type'] == offense_type:
                type_data[row['slug']] = row
            transformed.append(type_data)

    return json.dumps(transformed)

@blueprint.app_template_filter('json')
def json_filter(val):
    return json.dumps(val)

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
