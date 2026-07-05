<script setup>
// The description-list block through the Vue renderer — a key-value metadata grid. Static (no state), so
// it renders fully on the server. A value is a plain string or nested blocks (the Status rows compose a
// badge). Same block descriptors as the React gallery; verifies the Vue twin renders identically.
import { Page } from 'vike-blocks/vue'
import { definePage, heading, text, descriptionList, badge, link } from 'vike-blocks'

const page = definePage({
  sections: [
    heading('Description-list block').level(1),
    text('A key-value / metadata grid. A value is a string or nested blocks (a badge, a link). columns / bordered / per-item span. Responsive, static, theme-native.').tone('muted'),

    heading('Plain, two columns').level(3),
    descriptionList()
      .title('Order #1024')
      .item('Status', [badge('Paid').tone('success')])
      .item('Customer', 'Ada Lovelace')
      .item('Placed', 'Mar 3, 2026')
      .item('Total', '$248.00')
      .item('Invoice', [link('Download PDF').to('/invoices/1024')])
      .item('Shipping address', '12 Analytical Way, London EC1', { span: 2 })
      .columns(2),

    heading('Bordered, three columns').level(3),
    descriptionList()
      .item('Plan', 'Pro')
      .item('Seats', '12')
      .item('Renews', 'Aug 1, 2026')
      .item('Status', [badge('Active').tone('success')])
      .item('Billing', 'Annual')
      .item('Owner', 'ada@example.com')
      .columns(3)
      .bordered(),
  ],
})
</script>
<template>
  <div :style="{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }">
    <Page :page="page" />
    <p :style="{ marginTop: '1.5rem' }"><a href="/">&lt;- back to gallery</a></p>
  </div>
</template>
