Many cases leave the system long before they reach a <span data-term="verdict">verdict</span>, either through a <span data-term="bargain">plea bargain</span> or a similar deal. Many cases filed by police also don't result in a conviction.

For this data set, we look at cases that did result in convictions. 

Here's some of the numbers we found: 

{# TODO: Use a partial or whatever the equivalent Jinja pattern is for this #}

<div class="row big-stat-row">
  <div class="big-stat col-md-8 col-md-offset-2">
    <h3>{{ '{:,d}' | format_stat(statistics.convictions.value) }} {{ statistics.convictions.label }}</h3>
    <img src="img/{{ statistics.convictions.icon }}">
  </div>
</div>

<div class="row big-stat-row">
  {# Percentage of men/women in the system #}
  <div class="big-stat col-md-4 col-md-offset-2">
    <h3>{{ statistics.convictions_male_pct.value }} {{ statistics.convictions_male_pct.label }}</h3>
    <img src="img/{{ statistics.convictions_male.icon }}">
  </div>

  <div class="big-stat col-md-4">
    <h3>{{ statistics.convictions_female_pct.value }} {{ statistics.convictions_female_pct.label }}</h3>
    <img src="img/{{ statistics.convictions_female.icon }}">
  </div>
</div>

{# How many convictions are drug-related vs. violent vs. non-violent #}

## More convictions for drug crimes than for violent and property crimes combined 

{% include '_warnings.html' %}
 
<div id="charges-categories-chart" class="chart"></div>
