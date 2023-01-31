<template>
  <cw-base-group-broadcast-info :source="currentChat" />
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('chat', ['currentChat'])
  }
}
</script>
