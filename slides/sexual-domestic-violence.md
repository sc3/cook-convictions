Less than 1 percent of all convictions in our data are for domestic and sexual violence. This includes crimes such as domestic battery, stalking or violating an order of protection.   

Though our data does not indicate any details about the people victimized by these crimes, we know they are heavily underreported. [The National Crime Victimization Survey estimates](http://www.icpsr.umich.edu/icpsrweb/ICPSR/studies/34650) that only 28 per cent of sexual assaults and 55 per cent of domestic violence is reported. 

The gender disparity for domestic and sexual violence convictions leans heavily toward men - which is the case in all of our data. 

We also know that the vast majority of offenders have a relationship with the survivor to some degree. While stranger attacks may receive the majority of reporting in local news, they are a statistically small part of sexual and domestic violence. Because our data does not address victimization, it is difficult to place a figure on who is affected by these crimes, and their relationship to the accused.  

<figure id="affecting-women-viz-container">
  <div class="viz-container"></div>
  <figcaption>For every conviction of a woman for this category of crime, there were {{ domestic_male_to_female_ratio|default(11)|int }} convictions of men. There were a total of {{ statistics.domestic_male.value|int }} convictions of men and {{ statistics.domestic_female.value|int }} convictions of women.</figcaption>
</figure>

The goal for the project was to dive deeper into the conviction numbers to better understand the issue as it relates to Cook County. However, the number of domestic and sexual violence convictions were too low (649 convictions out of 141,161) to perform any reliable analysis. When we attempted to show these convictions geographically, the variance was too low to be meaningful. Without comprehensive information on charges we can't know if there were more cases the State's Attorney attempted to prosecute, but were acquitted.  

{% include '_warnings.html' %}
