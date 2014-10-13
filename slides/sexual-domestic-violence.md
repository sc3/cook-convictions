{% set slide_id = 'sexual-domestic-violence' %}

## A slice of reality: convictions for sexual and domestic violence

Less than 1 percent of all convictions in our data are for domestic and sexual violence. This includes crimes such as domestic battery, stalking or violating an order of protection.   

Though our data does not indicate any details about the people victimized by these crimes, studies show incidents of sexual assault and domestic violence are heavily [underreported](http://www.usatoday.com/story/news/nation/2013/11/19/study-sexual-assaults-greatly-underreported-/3648197/). 

The gender disparity for domestic and sexual violence convictions leans heavily toward men - which is the case in all of our data. 

<figure id="affecting-women-viz-container">
  <div class="viz-container"></div>
  <figcaption>For every conviction of a woman for this category of crime, there were {{ domestic_male_to_female_ratio|default(11)|int }} convictions of men. There were a total of {{ statistics.domestic_male.value|int }} convictions of men and {{ statistics.domestic_female.value|int }} convictions of women.</figcaption>
</figure>



{% include '_warnings.html' %}
