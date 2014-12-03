<table id="table-top-charges" class="table">
<thead>
  <tr>
    <th>Position</th>
    <th>Statute</th>
    <th>Charge Description</th>
    <th>Count</th>
  </tr>
</thead>
<tbody>
  {% for charge in top_charges %}
  <tr>
    <td>{{ loop.index }}</td>
    <td><a href="{{ charge.statute_url }}">{{ charge.statute }}</a></td>
    <td>{{ charge.chrgdesc }}</td>
    <td>{{ charge.count }}</td>
  </tr>
  {% endfor %}
</tbody>
</table>

There are several possible explanations for the majority of convictions being for low-level drug crimes. We know nationally that at least 90 percent of all convictions are the result of a plea deal. We have no reason to believe the Cook County rate meaningfully varies from this national rate. Also, it is common for crimes such as possession with intent to sell a certain drug will be reduced as a result of a plea deal to felony possession if the case cannot be made for the original charge. 
