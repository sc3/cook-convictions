cook-convictions
================

The [Tarbell](http://tarbell.io) project used to generate [Convicted in Cook](http://convictions.smartchicagoapps.org/).

## Development

In order to get started developing this project, these are the steps to follow.

### Install Tarbell

First, make sure you have [Tarbell](http://tarbell.io) installed and configured. 

It's best to install Tarbell inside of a [virtualenv](http://virtualenv.readthedocs.org/en/latest/).

To install Tarbell:  

    pip install tarbell==0.9b6  

To configure Tarbell:

    tarbell configure  

When the configuration script asks you, you should set up Google Spreadsheets, but you can leave Amazoon S3 setup for later.

### Running this site 

Clone the repo:  

    git clone git@github.com:sc3/cook-convictions.git

Change directory to the site's working copy:

    cd cook-convictions  

Load the Tarbell [blueprint](http://tarbell.readthedocs.org/en/latest/build.html#understanding-tarbell-blueprints), from https://github.com/bepetersn/tarbell-template:

    git submodule update --init  

Run the Tarbell [preview server](http://tarbell.readthedocs.org/en/latest/reference.html#tarbell-serve):

    tarbell serve  
