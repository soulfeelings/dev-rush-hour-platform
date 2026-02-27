// Clear any old localStorage form drafts left from previous cache model
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i)
  if (key?.startsWith('admin_') && key.includes('_form_draft_')) {
    localStorage.removeItem(key)
  }
}
