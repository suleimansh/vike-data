// The attachment block demo. Each attachment below is the `attachment` block rendered through the
// registry (resolvePage + <Blocks>). A dep-free, theme-native file-upload control — click the zone to
// open the picker, or drag files onto it and watch the border light up; selected files list below,
// each removable. Declared `files` are the initial list; the real upload is the actions axis (#385).
// An attachment composes inside a `field` (#426).
import { definePage, resolvePage, attachment, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Stack = ({ children }) => <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function AttachmentPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Attachment block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A dep-free, theme-native file-upload control. <code>attachment(label).accept(...).multiple().files([...])</code> — click the zone or
        drag files onto it; the border lights up and the selection lists below, each removable. Colors read vike-themes CSS vars. The real
        upload is the actions axis (#385).
      </p>

      <Label>Drop files or click</Label>
      <Stack>{Show([attachment('Drop files here or click to upload').accept('image/*,.pdf').multiple()])}</Stack>

      <Label>Single file, with a declared attachment</Label>
      <Stack>{Show([attachment('Upload your resume').accept('.pdf,.doc').files([{ name: 'resume.pdf', size: 248000 }])])}</Stack>

      <Label>Disabled</Label>
      <Stack>{Show([attachment('Locked').files([{ name: 'contract-final.pdf', size: 1548000 }]).disabled()])}</Stack>

      <Label>Inside a field</Label>
      <Stack>{Show([field('Attachments').description('PDF or images, up to 10 MB each.').control(attachment().accept('image/*,.pdf').multiple())])}</Stack>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
