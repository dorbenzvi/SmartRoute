export function phoneValidator(phone) {
  const re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/
  if (!phone || phone.length <= 0) return "Phone can't be empty."
  if (!re.test(phone)) return 'Ooops! We need a valid phone number.'
  return ''
}
