Driving under the influence (DUI) is one of the most frequent offenses for convictions. The top twenty Chicago neighborhoods for DUI conviction rates are spread across the city.  Interestingly, neighborhoods with widely disparate overall conviction rates, such as West Garfield Park and Irving Park, have similar conviction rates for DUI.  In this case, Irving Park, which has a slightly lower DUI conviction rate, has more than twice the number of DUI convictions as West Garfield Park. 

Here's the top 20 for DUI convictions in order of convictions per capita.  Note that the convictions rate has been rounded:

<table id="table-top-dui-community-areas" class="table">
<thead>
  <tr>
    <th>Position</th>
    <th>Community Area</th>
    <th>DUI Convictions per 1000 residents</th>
    <th>DUI Convictions</th>
  </tr>
</thead>
<tbody>
  {% for ca in top_dui_community_areas[:20] %}
  <tr>
    <td>{{ loop.index }}</td>
    <td>{{ ca.name }}</td>
    <td>{{ ca.per_1000 }}</td>
    <td>{{ ca.count | int }}</td>
  </tr>
  {% endfor %}
</tbody>
</table>
