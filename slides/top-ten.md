<table id="table-top-charges" class="table">
<thead>
  <tr>
    <th>Position</th>
    <th>Statute</th>
    <th>Charge Description</th>
    <th>Count</th>
    <th>Percent</th>
  </tr>
</thead>
<tbody>
  {% for charge in top_charges[:10] %}
  <tr>
    <td>{{ loop.index }}</td>
    <td><a href="{{ charge.statute_url }}">{{ charge.statute }}</a></td>
    <td>{{ charge.chrgdesc }}</td>
    <td>{{ charge.count|format_stat('{:,}') }}</td>
    <td>{{ charge.percent }}</td>
  </tr>
  {% endfor %}
</tbody>
</table>

There are several possible explanations for the majority of convictions being for low-level drug crimes. We know nationally that at least 90 percent of all convictions are the result of a plea deal. We have no reason to believe the Cook County rate meaningfully varies from this national rate. Also, it is common for crimes such as "possession [of a drug] with intent to sell" to be reduced as a result of a plea deal. These crimes are commonly reduced to felony possession if a case cannot be made in court for an individual to be tried on the original charge.

As the map below shows, the most common convicted offense throughout the city is possesion of controlled substance.  Driving under the influence (DUI) is another common offense, with community areas where this was the most common convicted offense forming two distinct belts. We chose not to map the most common convicition in suburban places because the number of convictions for the most common offense was often so low, or differed by so little from other types of offenses, that the map would give a distorted view of suburban offense trends.
