The top twenty neighborhoods for DUI convictions are spread across the city, with a few notable outliers on our list of convictions: West Town and Lincoln Square. 

Here's the top 20 for DUI convictions:

<table id="table-top-dui-community-areas" class="table">
<thead>
  <tr>
    <th>Position</th>
    <th>Community Area</th>
    <th>Number of Convictions</th>
  </tr>
</thead>
<tbody>
  {% for ca in top_dui_community_areas %}
  <tr>
    <td>{{ loop.index }}</td>
    <td>{{ ca.name }}</td>
    <td>{{ ca.count | int }}</td>
  </tr>
  {% endfor %}
</tbody>
</table>
