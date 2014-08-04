
import yaml, json, os


HOME_PATH = os.getenv('HOME')
CLIENT_SECRETS_PATH = HOME_PATH
SETTINGS_PATH = HOME_PATH
EMAIL = 'bepetersn@gmail.com'
PROJECTS_PATH = '{}/tarbell_projects'.format(HOME_PATH))
DEPLOY_SITE = 'convictions.smartchicagoapps.org'


def gen_client_secrets(config_path=CLIENT_SECRETS_PATH, google_id, google_secret):
    
    """ `configpath` is the path at which the client_secrets file will be created. """

    client_secrets = {
        "installed":
        {
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "client_secret": "{}".format(google_secret),
            "token_uri": "https://accounts.google.com/o/oauth2/token",
            "client_email": "",
            "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "oob"],
            "client_x509_cert_url": "",
            "client_id": "{}".format(google_id),
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
        }
    }

    try:
        with open(config_path, 'w') as f:
            json.dump(client_secrets, f)
    except IOError:
        print("Failed to generate a client secrets file.")

    return config_path


def gen_settings(config_path=SETTINGS_PATH, email=EMAIL, projects_path=PROJECTS_PATH, deploy_site=DEPLOY_SITE, 
                    amazon_id, amazon_secret):
    
    """ `configpath` is the path at which the settings file will be created. """

    settings = {       
        'default_s3_access_key_id': '<DEFAULT ACCESS KEY>',
        'default_s3_secret_access_key': '<DEFAULT SECRET KEY>',
        'google_account': '{}'.format(email),
        'projects_path': '{}'.format(projects_path),
        'default_s3_buckets': 
            {'production': '<PRODUCTION BUCKET>'},
        'project_templates':
        [
            {'name': 'Basic Bootstrap 3 template',
            'url': 'https://github.com/newsapps/tarbell-template'},
            {'name': 'Searchable map template',
            'url': 'https://github.com/eads/tarbell-map-template'}
        ],
        's3_credentials': 
            {'{}'.format(deploy_site): 
                {'access_key_id': '{}'.format(amazon_id),
                'secret_access_key': '{}'.format(amazon_secret)}
            }
    }

    try:
        with open(config_path, 'w') as f:
            yaml.dump(settings, f, default_flow_style=False)
    except IOError:
        print("Failed to generate a settings file.")

    return config_path

