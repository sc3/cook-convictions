{% set slide_id = 'timeline' %}

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
