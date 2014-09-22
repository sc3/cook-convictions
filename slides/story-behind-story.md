{% set slide_id = 'story-story' %}

## The Story Behind the Story

This data is public information, but it didn't come easily. It took the Chicago Justice Project over two years to obtain the data used in this project.

What we asked for: all the data involved in all the cases that entered the court for a five-year period, whether or not the case ended in a conviction, including categories such as race.    

<div id="timeline-embed"></div>
<script>
var timeline_config = {
  width:              '100%',
  height:             '600',
  source:             '{{ timeline_spreadsheet_url }}',
  embed_id:           'timeline-embed'      
};
</script>
<script src="//cdn.knightlab.com/libs/timeline/latest/js/storyjs-embed.js"></script>

{% include 'slides/_edit_this.md' %}
