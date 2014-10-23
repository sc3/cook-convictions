{% set slide_id = 'about-data' %}
{% from 'macros/_popout.html' import popout %}

## Windy City Convictions by the Numbers

One of the key challenges in analyzing our data was understanding the records in our spreadsheet and learning how they related to other important but unrepresented parts of the criminal justice system.

We faced several changes. Below we’ve spelled out the difficulties we encountered, and how dealt with them. 

We don’t know if we received every conviction. 
- We requested records for every conviction, but because of data access issues in Cook County, we don’t know if we received them all. We also requested records from between 2005 and 2009. However, we were only able to identify convictions when we had the initial records for a case. As a result, we had to exclude cases that started before 2005 from our analysis.

We don’t know how many cases were dismissed or resulted in an acquittal
- Since the data only contains records for cases that result in convictions, we don't have any records for cases that were dismissed or resulted in an acquittal. More broadly, we don’t know the total number of cases filed.

 We don’t know an individual’s initial charge
- The data reflects what happens with a criminal case once it proceeds through the court system, so we don’t know the initial charges of the individuals who appear in our data. While we were given some information about the individuals in the dataset, such as home address, the data didn’t include their race, or their prior convictions.

We weren’t only seeing the completed conviction
- Each row in the dataset represents a disposition in a criminal case that resulted in a conviction. Dispositions are judicial actions in a case. They represent convictions, but also changes in a charge, a case being postponed or a case switching to a different judge. We had to extract convictions from these records.

Crime values were not entered consistently 
- The data was analyzed primarily by the type of crime that resulted in a conviction and where the convicted person was from. The type of crime is identified in the data by statute and charge description fields. However, these values were not entered consistently. We examined the data and used a variety of database queries to try to group records that corresponded to the same type of crime. 

Frequent misspellings and inconsistent abbreviations
- Similarly, there were frequent misspellings and abbreviations for city and state values for the home address. In other cases, an individual's home address may be a correctional institution or they may be homeless. Where we could, we used the street address and zip code to geocode the home address and map them to a Chicago community area or suburb. 

The logic for identifying convictions, identifying neighborhoods or suburbs and grouping by charge type were implemented in Python scripts. You can view the source of these scripts in the [project's repository](https://github.com/sc3/cook-convictions-data/).

{% include 'slides/_edit_this.md' %}
