export const copyToClipboard = (text: string) => {
  return navigator.clipboard.writeText(text).catch(err => {
    console.error('Could not copy text: ', err)
  })
}
