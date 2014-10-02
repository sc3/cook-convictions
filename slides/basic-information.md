
## Meet the Data

Many cases leave the system long before they reach a verdict, either through a plea bargain or a similar deal. Many cases filed by police also don't result in a convction.

For this data set, we have cases that did result in convictions. 

Here's some of the numbers we found: 

{# TODO: Use a partial or whatever the equivalent Jinja pattern is for this #}

<div class="row big-stat-row">
  <div class="big-stat col-md-4 col-md-offset-2">
    <img src="img/{{ statistics.convictions.icon }}">
    <h3>{{ '%d' | format(statistics.convictions.value) }} {{ statistics.convictions.label }}</h3>
    <p>{{ statistics.convictions.icon_attribution }}</p>
  </div>

  {# How many records are we looking at? #}
  <div class="big-stat col-md-4">
    <img src="img/{{ statistics.dispositions_2005_onward.icon }}">
    <h3>{{ '%d' | format(statistics.dispositions_2005_onward.value) }} {{ statistics.dispositions_2005_onward.label }}</h3>
    <p>{{ statistics.dispositions_2005_onward.description }}</p>
  </div>
</div>

<div class="row big-stat-row">
  {# Percentage of men/women in the system #}
  <div class="big-stat col-md-4 col-md-offset-2">
    <img src="img/{{ statistics.convictions_male.icon }}">
    <h3>{{ statistics.convictions_male_pct.value }} {{ statistics.convictions_male_pct.label }}</h3>
  </div>

  <div class="big-stat col-md-4">
    <img src="img/{{ statistics.convictions_female.icon }}">
    <h3>{{ statistics.convictions_female_pct.value }} {{ statistics.convictions_female_pct.label }}</h3>
  </div>
</div>

{# How many convictions are drug-related vs. violent vs. non-violent #}

## Drug crimes are the biggest chunk of convictions
 
<div id="charges-categories-chart" class="chart"></div>

