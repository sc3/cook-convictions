{% set slide_id = 'sexual-domestic-violence' %}

## A slice of reality: convictions for sexual and domestic violence

The people that are victimized by domestic or sexual violence are very different - men and women of many ages and from all over the city. Our data does not indicate any details about the people victimized by these crimes. But outside knowledge tells us that women are disproportionately affected. It also tells us that these types of crimes are heavily underreported.

<figure id="affecting-women-viz-container">
  <div class="viz-container"></div>
  <figcaption>For every conviction of a woman for this category of crime, there were {{ domestic_male_to_female_ratio|default(11)|int }} convictions of men. There were a total of {{ statistics.domestic_male.value|int }} convictions of men and {{ statistics.domestic_female.value|int }} convictions of women.</figcaption>
</figure>

There is also a signicant breadth of crimes that are encompassed in the terms domestic or sexual crimes. Below are a few encompassed in this definition:

{crime list with 4-5 word lay description}
Maybe: Boxes showing proportionate sizes to percent of convictions each crime represents.

{% include '_warnings.html' %}
