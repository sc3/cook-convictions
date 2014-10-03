{% set slide_id = 'sexual-domestic-violence' %}

## A slice of reality: convictions for sexual and domestic violence

The people that are victimized by domestic or sexual violence are very different - men and women of many ages and from all over the city. Our data does not indicate any details about the people victimized by these crimes. But outside knowledge tells us that women are disproportionately affected. It also tells us that these types of crimes are heavily underreported. 

{# TODO: Show small icons of man women based on number in percent #}

<div class="row big-stat-row">
  <div class="big-stat col-md-4 col-md-offset-2">
    <img src="img/{{ statistics.domestic_male_pct.icon }}">
    <h3>{{ statistics.domestic_male_pct.value }} {{ statistics.domestic_male_pct.label }}</h3>
    <p>{{ statistics.domestic_female_pct.description }}</p>
  </div>

  <div class="big-stat col-md-4">
    <img src="img/{{ statistics.domestic_female_pct.icon }}">
    <h3>{{ statistics.domestic_female_pct.value }} {{ statistics.domestic_female_pct.label }}</h3>
    <p>{{ statistics.domestic_female_pct.description }}</p>
  </div>
</div>

There is also a signicant breadth of crimes that are encompassed in the terms domestic or sexual crimes. Below are a few encompassed in this definition: 

{crime list with 4-5 word lay description} 
Maybe: Boxes showing proportionate sizes to percent of convictions each crime represents. 

This map allows you to see how sexual and domestic violence is spread spatially across the city: 

[MAP] 

{% include '_warnings.html' %}
