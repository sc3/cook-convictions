cook-convictions
==============

## Development

In order to get started developing this project, these are the steps you should follow.

### Getting Tarbell
First, make sure you have [Tarbell](http://tarbell.tribapps.com/) installed and setup. 

If it's not already installed, here's the two steps you need to get it (assuming you have a [virtualenv](http://virtualenv.readthedocs.org/en/latest/)):  

    sudo pip install tarbell==0.9b9  
    tarbell configure  

Note: When it asks you, you should set up Google Spreadsheets, but you can leave Amazoon S3 setup for later.

### Getting the mockup

Clone the repo:  

    git clone git@github.com:sc3/cook-convictions.git

Do some setup and launch the Tarbell preview server:  

    cd cook-convictions  
    git submodule update --init  
    tarbell serve  
