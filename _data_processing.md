In order to analyze the data and make it available for public access, the project team had to load the raw data, which was provided in [comma-separated values](http://en.wikipedia.org/wiki/Comma-separated_values) (CSV) format, into a database.  We also had to perform multiple transforms on the data in order to make it easier to query the data for our analysis.  The data loading and transformations are performed by a series of Python scripts.  You can view the source code repository for the scripts [here](https://github.com/sc3/cook-convictions-data).

### Fixing shifted columns

In CSV files columns containing commas are accommodated by wrapping the value in quotation marks.  Similarly, quotation marks can be used in a column value if it is escaped.  However, improper escaping can cause columns in a row to be shifted.  When doing initial queries on the data we identified these improperly escaped fields and updated the data loading scripts to fix the shifted fields.

### Creating cleaner records

Other than fixing the shifted columns, the data was loaded into the database in the same format as the raw data.  In the next step of the data processing pipeline, we create new records where values are parsed and cleaned. 

* In the raw data, the city and state portion of the address of the convicted person are stored in a single field.  We split these into separate fields. fix blatant typos and misspellings and typos and, when possible, normalize the state to its two-letter abbreviation.
* The fields that describe minimum and maximum sentences in the raw data are encoded so that the years, months and days of the sentence as well as whether the sentence is for life in prison or a death sentence is all stored in a single field.  This makes it difficult to compare the lengths of sentences, so the years, months and days values are parsed out and stored as numeric values.  The flags for life sentences and death sentences are parsed out and stored as boolean values.
* Fields that describe the offenses in a case appear to have been manually entered and can vary widely.  Different spacing, punctuation and section delimiters are used to write the statute reference for the same portion of the law.  When possible, we parsed these values and added a field for the [Uniform Crime Reporting](http://www.fbi.gov/about-us/cjis/ucr/ucr) code [used by the Illinois State Police](http://www.isp.state.il.us/crime/ucrhome.cfm).
* The raw data contains fields for both initial and amended statutes and charge descriptions.  As a convenience for querying we add a column indicating the final sentence and charge description.
* Date fields were converted from text strings to the databases date format.

### Loading additional dataset

Spatial data describing Chicago community area boundaries, census tracts and [census places](https://www.census.gov/geo/reference/gtc/gtc_place.html) was loaded into the database.

Tract-level demographic data from the American Community Survey (ACS) was exported from the United States Census Bureau's [American Fact Finder](http://factfinder2.census.gov/) tool.  This data was aggregated from the cenus tract level to CHicago community areas.

### Geocoding and finding spatial relationships

The addresses in the cleaned records were geocoded using [Mapquest's Open Geocoding API web service](http://developer.mapquest.com/web/products/open/geocoding-service).  Once geocoded we used the database's spatial capabilities to determine the Chicago community area or suburban place corresponding to the convicted person's address.

### Identifying convictions

The records in the data represent a series of events in a case.  So, there will be one record for someone's initial conviction and another record if their sentence is later changed.  While this accurately describes a criminal case's proceedings we can't simply count records to get a picture of how many people were convicted and how many convictions there are for any given crime. 

We identified convictions like this:

* Each unique statute in a case gets counted as a conviction.
* If there are multiple records within a case with the same statute and disposition description these are interpreted as multiple counts of a crime and are counted as separate convictions.

### Querying and exporting data

The data that drives the charts and maps in this project comes from code that implements database queries for statistics of interest.  We also implemented management commands to export the results of these queries in machine-readable file formats like CSV and JSON that can be presented on the web.  There is also a script that exports the version of the data that we've made publicly available which removes exact addresses and other personal identifiers from the records.

### Mapping convictions 

The data includes records for people convicted in Cook County's courts, regardless of their home address.  Many of the convicted had home addresses in Chicago or Cook County, but some had addresses in other parts of Illinois, or other states.  To focus on areas familiar to the audience of this site, we chose to map conviction rates only for the City of Chicago and suburban places in Cook County.

To be able to compare the number of convictions, adjusted to population, we needed to use geographies for which American Community Survey population figures were available.  For Chicago, these were [community areas](http://en.wikipedia.org/wiki/Community_areas_in_Chicago), which roughly correspond to neighborhoods, and for suburbs, we used [census places](https://www.census.gov/geo/reference/gtc/gtc_place.html).  Some suburban places include portions that are outside of Cook County.  Because the purpose of mapping conviction rates was to show overall spatial trends, and because of the challenges of separating both home addresses and population between the areas inside and outside Cook County, our maps reflect the entire area and population of these places.

### Categorizing crimes

We charted the number of convictions for violent index, property index and drug offenses.  We also counted convictions of offenses that disproportionately affect women, such as sexual assault and domestic violence.  Violent index, property index and offenses often affecting women were identified by mapping a record's offense statute to an Illinois Unified Crime Reporting (IUCR) code using [this table](https://www.isp.state.il.us/docs/6-260.pdf) from the Illinois State Police.  This table helped the Chicago Justice Project define categories of IUCR codes.  Rather than listing the codes that correspond to each category here, please refer to the [source code](https://github.com/sc3/cook-convictions-data/blob/master/convictions_data/query/iucr.py) that implements the categorical queries.

Drug crimes were also identified by statute, but there were not useful IUCR-delinieated categories.  Instead, we wrote queries that categorized the offenses by the offense class specified in the Illinois Compiled Statutes and by the type of drug indicated by the offense statute.  The source code for these queries is [here](https://github.com/sc3/cook-convictions-data/blob/master/convictions_data/query/drugs.py).

### Handling ages

The age of convicted individuals was calculated by taking the difference between the the charge disposition date field and the date of birth field.  We did not expect to receive records for people under the age of 18, though some records for apparent juveniles do appear in the data.  As we were not sure whether we received records for all cases involving juveniles and had no way of differentiating between records for juveniles and incorrectly entered dates of birth, we excluded records of juveniles when doing age-based comparisons.  These records were included in total counts of convictions and in comparisons based on the type of crime.
